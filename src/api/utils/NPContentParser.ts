
/**
 * NPContentParser.ts
 * A utility module to transform raw NPClient responses into clean,
 * typed objects ready for React components.
 */
import type { AgentMessage, Display, DisplayHints, DisplayInfo, Say} from "../types/NPJWI";

// ==========================================
// Types for the UI Layer
// ==========================================

export interface UIHint {
    id: string;
    label: string;
    value: string;
    type: "List" | "Buttons" | "InfoButtons" ;
}


// export interface UIDetailItem {
//     id: string;
//     index?: number;
//     uid?: string;
//     titleVisual: string;
//     titleAudio: string;
//     description: string;
//     htmlContent?: string;
//     voiceContent?: string;
//     raw: any;
// }

// export interface UIParsedResponse {
//     id: string;
//     role: "agent" | "user";
//     sourceIds?: string[];
//     say: string;
//     display: string; 
//     hints: UIHint[];
//     tts?: string;
//     infoItems?: UIDetailItem[];
//     infoItemsMeta?: {
//         total: number;
//         available: number;
//         startIndex: number;
//     };
//     isActionableMessage: boolean;
// }

export interface InfoItem {
    id: string;
    index: number;
    uid: string;
    qid: string;
    titleVisual: string;
    titleAudio: string;
}

export interface UIAgentMessage {
    id: string;
    role: "agent";
    type: string;
    sourceIds?: string[];
    voice: string;
    visual: string; 
    hints: UIHint[];
    infoItems?: InfoItem[];
    infoItemsMeta?: {
        total: number;
        available: number;
        startIndex: number;
    };
    isActionableMessage: boolean;
}


/**
 * Main Parser Class
 */
export class NPContentParser {

    // Parse a NPJWI AgentMessage into a unified UI model
    static processAgentMessage(NPJWIAgentMessage: AgentMessage): UIAgentMessage {
        // Generate a unique ID for the message
        let id = NPJWIAgentMessage.sessionID + "_" + NPJWIAgentMessage.agentMessageID;
        let type: string = "Clear"; // "Dashboard" | "ResultsNew" | "ResultsAdditional" | "ResultsAdditionalRepeat" | "Details" | "Clear";
        let statementVisual = "";
        let statementVoice = "";
        let promptVisual = "";
        let promptVoice = "";
        let infoVisual = ""; 
        let infoVoice = "";
        let infoItems: InfoItem[] = [];
        let infoItemsMeta: { total: number; available: number; startIndex: number; } | undefined;
        let hints: UIHint[] = [];
        let sourceIds: string[] = [];

        if (NPJWIAgentMessage.say) {
            const sayObject = this.processAgentSay(NPJWIAgentMessage.say);
            statementVisual = sayObject.statementVisual;
            statementVoice = sayObject.statementVoice;
            promptVisual = sayObject.promptVisual;
            promptVoice = sayObject.promptVoice;
        }

        if (NPJWIAgentMessage.display) {
            const displayObject = this.processDisplay(NPJWIAgentMessage.display, id);
            infoVisual = displayObject.infoVisual;
            infoVoice = displayObject.infoVoice;
            hints = displayObject.hints;
            infoItems = displayObject.infoItems;
            infoItemsMeta = displayObject.meta;
            type = NPJWIAgentMessage.display.info.type;
            sourceIds = displayObject.sourceIds;
        }
        let visual = statementVisual + infoVisual + " " + promptVisual;
        let voice = statementVoice + infoVoice + promptVoice; 


        return {
            id: id,
            role: "agent",
            type: type,
            sourceIds: sourceIds,
            voice: voice,
            visual: visual,
            hints: hints,
            infoItems: infoItems,
            infoItemsMeta: infoItemsMeta,
            isActionableMessage: type === "Details"
        };
    }

    static processDisplay(display: Display, message_id: string): { infoItems: InfoItem[], meta: any, infoVisual: string, infoVoice: string, hints: UIHint[], sourceIds?: string[]} {
         let infoItems: InfoItem[] = [];
         let infoVisual = "";
         let infoVoice = "";
         let meta: any = undefined;
         let sourceIds: string[] = [];
         let type = display.info?.type;
         
         if (type === "Details") {
             const result = this.processDisplayDetail(display.info);
             infoVisual = result.infoVisual;
             infoVoice = result.infoVoice;
             sourceIds = result.sourceIds;
         } else if (type === "ResultsNew" || type === "ResultsAdditional") {
             const result = this.processDisplayList(display.info, message_id);
             infoItems = result.infoItems;
             meta = result.meta;
             infoVisual = result.infoVisual;
             infoVoice = result.infoVoice;
         }

         const hints = this.processDisplayHints(message_id, display.hints);
         return { infoItems, meta, infoVisual, infoVoice, hints, sourceIds };
    }


    // Create AgentSay content object that collects both visual and voice content for statements and prompts type:
    static createAgentSayObject(say: Say[]): {"statements": {visual: string, voice: string}[], "prompts": {visual: string, voice: string}[], "hints": {visual: string, voice: string}[], "infos": {visual: string, voice: string}[]} {
        const statements: {visual: string, voice: string}[] = [];
        const prompts: {visual: string, voice: string}[] = [];
        const hints: {visual: string, voice: string}[] = [];
        const infos: {visual: string, voice: string}[] = [];
        say.forEach(s => {
            const content = { visual: s.visual, voice: s.voice };
            switch(s.type) {
                case "Statement":
                    statements.push(content);
                    break;
                case "Prompt":
                    prompts.push(content);
                    break;
                case "Hints":
                    hints.push(content);
                    break;
                case "Info":
                    infos.push(content);
                    break;
            }
        });
        return { statements, prompts, hints, infos };
    }

    // Process sourceIds from sourceIDString 
    // e.g. "subsection_5_29\nsentence_5_251\nsentence_5_252\nparagraph_5_161"
    static getSourceIds(sourceIdString: string) {
        const sourceIds = sourceIdString.split("\n");
        return sourceIds;
    }

    // Extracts the statementVisual, statementVoice, promptVisual, promptVoice from the say array
    static processAgentSay(sayArray: Say[]): {statementVisual: string, statementVoice: string, promptVisual: string, promptVoice: string} {

        if (!sayArray) return {statementVisual: "", statementVoice: "", promptVisual: "", promptVoice: ""};
        const sayObject = this.createAgentSayObject(sayArray);
        return {
            statementVisual: sayObject.statements.map(s => s.visual).join(""),
            statementVoice: sayObject.statements.map(s => s.voice).join(""),
            promptVisual: sayObject.prompts.map(s => s.visual).join(""),
            promptVoice: sayObject.prompts.map(s => s.voice).join("")
        }
    }

    // Transforms raw API hints into UIHint objects
    static processDisplayHints(message_id: string, hints?: DisplayHints): UIHint[] {
        if (!hints || !hints.entries) return [];

        const type = hints.options?.type || "List";

        return hints.entries.map((entry, index) => ({
            id: `${message_id}_hint_${index}`,
            label: entry.visualLabel,
            value: entry.returnValue,
            type: type as any
        }));
    }

    // Parses the complex 'info' object, specifically handling XML in resultFields
    // Returns the concatenated HTML content and structured results.
    // Parses "Details" type info
    static processDisplayDetail(info: DisplayInfo): { infoVisual: string, infoVoice: string, sourceIds: string[]} {
        if (!info || !info.data || !info.data.details) return { infoVisual: "", infoVoice: "", sourceIds: [] };
        const resultFields = info?.data?.details?.resultFields || [];
        
        let titleVisual = "";
        let titleAudio = "";
        let responseXml = "";

        // 1. Extract raw values from resultFields
        for (const field of resultFields) {
            const name = field.name;
            const val = field.values && field.values.length > 0 ? field.values[0] : "";
            if (name === "TitleVisual") titleVisual = val;
            if (name === "TitleAudio") titleAudio = val;
            if (name === "Response") responseXml = val;
        }

        // 2. Parse the XML content if present
        const parsed = this.parseResponseXML(responseXml);
        const infoVisual = parsed.InfoVisual;
        const infoVoice = parsed.InfoVoice;

        // 3. Send to UI the sourceIds for reference if exists
        let sourceIds: string[];
        const additionalFields = info?.data?.details?.additionalFields || [];
        if (additionalFields && additionalFields.length > 0) {
            for (const field of additionalFields) {
                const name = field.name;
                const val = field.values && field.values.length > 0 ? field.values[0] : "";
                if (name === "SourceIds") sourceIds = this.getSourceIds(val);
            }
        }
        
        return {
            infoVisual,
            infoVoice,
            sourceIds
        };
    }
    

    // Process "ResultsNew" (List) type info
    static processDisplayList(info: DisplayInfo, message_id: string): { infoItems: InfoItem[], meta: any, infoVisual: string, infoVoice: string } {
        if (!info || !info.data || !info.data.results) return { infoItems: [], meta: undefined, infoVisual: "", infoVoice: "" };

        let items = Array.isArray(info.data.results) 
            ? info.data.results 
            : [info.data.results];
        
        const { total, available, startIndex } = info.data;
        const meta = { total, available, startIndex };

        if (items.length === 0) return { infoItems: [], meta, infoVisual: "", infoVoice: "" };

        // const infoItems = items.map((item: any) => this.processDetailItem(item));
        let infoItems: InfoItem[] = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const itemIndex = item.index;
            const resultFields = item.resultFields;
            let infoItem: InfoItem = {
                id: `${message_id}_info_${itemIndex}`,
                uid: item.uid,
                qid: item.qid,
                index: itemIndex,
                titleVisual: "",
                titleAudio: "", 
            };
            for (const field of resultFields) {
                
                const name = field.name;
                const val = field.values && field.values.length > 0 ? field.values[0] : "";
                
                if (name === "TitleVisual") infoItem.titleVisual = val;
                if (name === "TitleAudio") infoItem.titleAudio = val;
            }
            infoItems.push(infoItem);
        }
        
        return { infoItems, meta, infoVisual: "", infoVoice: "" };
    }

    //Helper to parse the responsexml to get info visual and info voice
    private static parseResponseXML(xmlString: string): { InfoVisual: string, InfoVoice: string } {
        try {
            const parser = new DOMParser();
            const dataXML = parser.parseFromString(xmlString, "text/xml");
            const params = dataXML.getElementsByTagName("Param");
            let visual = "";
            let voice = "";

            for (let i = 0; i < params.length; i++) {
                const param = params[i];
                const type = param.getAttribute("type");
                if (type === "MarkupHTML") {
                    if (param.childNodes.length>0) {
                        visual = this.unEscapeHTMLString(param.childNodes[0].nodeValue);
                    }
                } else if (type === "Voice") {
                    if (param.childNodes.length>0) {
                        voice = this.unEscapeHTMLString(param.childNodes[0].nodeValue);
                    }
                }
            }
            return { InfoVisual: visual, InfoVoice: voice };
        } catch (e) {
            console.warn("Failed to parse ResponseXML", e);
            return { InfoVisual: "", InfoVoice: "" };
        }
    }

    // Clean up text to html entities
    private static unEscapeHTMLString(text: string): string {
        if (!text) return "";

        const entities: { [key: string]: string } = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '\\\"',
            '&apos;': "'",
            '&#039;': "'",
            '&#39;': "'",
            '&nbsp;': ' ',
            '&bsl;': "\\\\",
            '&perc;': '%',
        };

        return text.replace(/&([a-z0-9]+|#[0-9]{1,6}|#x[0-9a-fA-F]{1,6});/g, (match, entity) => {
            // Check direct map matches
            if (entities[match]) {
                return entities[match];
            }
            return match;
        });
    }
}
