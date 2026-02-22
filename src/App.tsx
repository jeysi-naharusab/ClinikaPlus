import AppRoutes from './AppRoutes.tsx';
import { BillingPaymentsProvider } from './context/BillingPaymentsContext.tsx';

function App() {
  return (
    <BillingPaymentsProvider>
      <AppRoutes />
    </BillingPaymentsProvider>
  );
}

export default App;
