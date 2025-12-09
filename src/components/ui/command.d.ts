import * as React from 'react';

export interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {
  filter?: (value: string, search: string) => number;
}

export interface CommandInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export interface CommandListProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface CommandEmptyProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  heading?: string;
}

export interface CommandItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  keywords?: string[];
  onSelect?: (value: string) => void;
  disabled?: boolean;
}

export interface CommandSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface CommandShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {}

export declare const Command: React.ForwardRefExoticComponent<CommandProps & React.RefAttributes<HTMLDivElement>>;
export declare const CommandInput: React.ForwardRefExoticComponent<CommandInputProps & React.RefAttributes<HTMLInputElement>>;
export declare const CommandList: React.ForwardRefExoticComponent<CommandListProps & React.RefAttributes<HTMLDivElement>>;
export declare const CommandEmpty: React.ForwardRefExoticComponent<CommandEmptyProps & React.RefAttributes<HTMLDivElement>>;
export declare const CommandGroup: React.ForwardRefExoticComponent<CommandGroupProps & React.RefAttributes<HTMLDivElement>>;
export declare const CommandItem: React.ForwardRefExoticComponent<CommandItemProps & React.RefAttributes<HTMLDivElement>>;
export declare const CommandSeparator: React.ForwardRefExoticComponent<CommandSeparatorProps & React.RefAttributes<HTMLDivElement>>;
export declare const CommandShortcut: React.ForwardRefExoticComponent<CommandShortcutProps & React.RefAttributes<HTMLSpanElement>>;
