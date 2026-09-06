import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/shadcn/ui/dropdown-menu";
import { Button } from "@/components/shadcn/ui/button";
import { MoreVertical } from "lucide-react";

export const BaseDropdown = ({ 
  triggerIcon = <MoreVertical className="h-4 w-4" />,
  label = "Actions",
  items = [], 
  className = "",
  ...props 
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        className={`inline-flex shrink-0 items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0 cursor-pointer ${className}`} 
        {...props}
      >
        <span className="sr-only">Open menu</span>
        {triggerIcon}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {label && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuLabel>{label}</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}
        {items.map((item, idx) => (
          item.separator ? (
            <DropdownMenuSeparator key={`sep-${idx}`} />
          ) : (
            <DropdownMenuItem 
              key={idx} 
              onClick={item.onClick}
              className={`cursor-pointer flex items-center ${item.danger ? 'text-destructive focus:text-destructive' : ''}`}
            >
              {item.icon && <span className="mr-2 h-4 w-4">{item.icon}</span>}
              {item.label}
            </DropdownMenuItem>
          )
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
