import { BrowserRouter as Router } from "react-router-dom";
import { Direction } from "radix-ui";
import AppProviders from "./app/providers/AppProviders";
import AppShell from "./app/layout/AppShell";

function App() {
  return (
    <Direction.DirectionProvider dir="rtl">
      <AppProviders>
        <Router>
          <AppShell />
        </Router>
      </AppProviders>
    </Direction.DirectionProvider>
  );
}

export default App;
