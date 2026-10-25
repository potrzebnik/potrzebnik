import { activationScriptSource } from './lib/activation';

export function FeedbackActivationScript() {
  return (
    // Fixed source from this folder with no user data in it; it has to run during HTML parsing,
    // before hydration, so it cannot be a regular client effect.
    <script dangerouslySetInnerHTML={{ __html: activationScriptSource() }} />
  );
}
