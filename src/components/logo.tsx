import { cn } from "@/lib/utils";
import ExpandedNetPeopleLogoDarkMode from "@/assets/netpeople_negative_expanded_428x101_final.png"
import ExpandedNetPeopleLogoLightMode from "@/assets/netpeople_positive_expanded_428x101_final.png"
import NetPeopleLogoIconDarkMode from "@/assets/netpeople_negative_icon_101x101_final.png"
import NetPeopleLogoIconLightMode from "@/assets/netpeople_positive_icon_101x101_final.png"
import { useThemeContext } from "@/hooks/themeContext";

interface LogoProps {
  collapsed?: boolean;
  className?: string;
}

export const Logo = ({ collapsed = false, className }: LogoProps) => {
  const { theme } = useThemeContext();
  const LogoIcon = theme === "dark" ? NetPeopleLogoIconDarkMode : NetPeopleLogoIconLightMode;
  const LogoExpanded = theme === "dark" ? ExpandedNetPeopleLogoDarkMode : ExpandedNetPeopleLogoLightMode;
  
  return collapsed ? (
    <img className={cn("h-9 w-auto object-contain", className)} src={LogoIcon} alt="Logo" />
  ) : (
    <img className={cn("h-9 w-auto object-contain", className)} src={LogoExpanded} alt="NetPeople" />
  );
};

// Interactive wrapper for sidebar
interface SideBarLogoButtonProps {
  collapsed?: boolean;
  onClick?: () => void;
  className?: string;
}

export const SideBarLogoButton = ({ collapsed = false, onClick, className="" }: SideBarLogoButtonProps) => {
  return (
    <button 
      onClick={onClick} 
      className={cn(
        "flex items-center transition-all duration-300 gap-3",
        collapsed ? "justify-center" : "justify-start px-2"
      )}
    >
      <Logo collapsed={collapsed} className={className} />
    </button>
  );
};

