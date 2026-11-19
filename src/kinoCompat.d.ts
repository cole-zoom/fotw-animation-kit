// Kino (where these files were first written) reads a `name` attribute on divs
// to label layers in its timeline. React passes it through harmlessly; this
// just keeps TypeScript quiet so the files stay identical between the two.
import "react";
declare module "react" {
  interface HTMLAttributes<T> {
    name?: string;
  }
}

// Kino also reads `Component.schema = z.object({...})` to build a props panel
// in its GUI. Remotion ignores it.
declare module "react" {
  interface FunctionComponent<P> {
    schema?: unknown;
  }
}
