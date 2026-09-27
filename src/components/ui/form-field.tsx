import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

const controlClassName =
  "min-h-11 w-full border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-foreground focus:ring-2 focus:ring-accent/70 aria-[invalid=true]:border-accent";

type FieldWrapperProps = {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
};

export function FieldWrapper({
  label,
  htmlFor,
  error,
  hint,
  children,
}: FieldWrapperProps) {
  const descriptionId = error ? `${htmlFor}-error` : `${htmlFor}-hint`;

  return (
    <div className="space-y-2">
      <label
        className="block text-sm font-medium text-foreground"
        htmlFor={htmlFor}
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-accent" id={descriptionId} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-muted" id={descriptionId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement>;

export function TextInput({ className, ...props }: TextInputProps) {
  return <input className={cn(controlClassName, className)} {...props} />;
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextArea({ className, ...props }: TextAreaProps) {
  return (
    <textarea
      className={cn(controlClassName, "min-h-28 py-3", className)}
      {...props}
    />
  );
}
