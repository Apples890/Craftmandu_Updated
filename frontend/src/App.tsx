import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AppRoutes from './routes/Router';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
          <div className="min-h-screen bg-white flex flex-col">
            <Header />
            <main className="flex-grow">
              <AppRoutes />
            </main>
            <Footer />
          </div>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
