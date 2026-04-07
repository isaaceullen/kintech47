# Custom Agent Instructions

## Google Analytics 4 (GA4) Event Tracking
Whenever creating new important action buttons (e.g., "Comprar", "Adicionar ao Carrinho", "Enviar Mensagem", "Assinar"), you MUST automatically include a call to the `trackEvent` function from `components/GoogleAnalytics.tsx` with descriptive event names and parameters.

Example:
```tsx
import { trackEvent } from '@/components/GoogleAnalytics';

// Inside your component
const handleImportantAction = () => {
  trackEvent('click_important_action', { 
    action_type: 'purchase',
    item_name: 'Product A'
  });
  // ... rest of the logic
};
```
