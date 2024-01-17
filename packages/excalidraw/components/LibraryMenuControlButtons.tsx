import { ExcalidrawProps, UIAppState } from "../types";
import LibraryMenuBrowseButton from "./LibraryMenuBrowseButton";
import clsx from "clsx";

export const LibraryMenuControlButtons = ({
  libraryReturnUrl,
  theme,
  id,
  style,
  children,
  className,
  featureFlagLibraryButton
}: {
  libraryReturnUrl: ExcalidrawProps["libraryReturnUrl"];
  theme: UIAppState["theme"];
  id: string;
  style: React.CSSProperties;
  children?: React.ReactNode;
  className?: string;
  featureFlagLibraryButton?: boolean;
}) => {
  return (
    <div
      className={clsx("library-menu-control-buttons", className)}
      style={style}
    >
      {featureFlagLibraryButton &&
        <LibraryMenuBrowseButton
          id={id}
          libraryReturnUrl={libraryReturnUrl}
          theme={theme}
        />
      }
      {children}
    </div>
  );
};
