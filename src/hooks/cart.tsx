import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  // eslint-disable-next-line camelcase
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // await AsyncStorage.clear();
      const storagedProducts = await AsyncStorage.getItem(
        '@GoMarkeplace:products',
      );

      if (storagedProducts) {
        setProducts(JSON.parse(storagedProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART

      const productExists = products.find(prod => prod.id === product.id);

      if (productExists) {
        const storagedProducts = products.map(prod => {
          return prod.id === product.id
            ? { ...prod, quantity: prod.quantity + 1 }
            : prod;
        });
        setProducts(storagedProducts);
      } else {
        const newProductCart = { ...product, quantity: 1 } as Product;
        setProducts([...products, newProductCart]);
      }

      await AsyncStorage.setItem(
        `@GoMarkeplace:products`,
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART

      const storagedProducts = products.map(product => {
        return product.id === id
          ? { ...product, quantity: product.quantity + 1 }
          : product;
      });

      setProducts(storagedProducts);

      await AsyncStorage.setItem(
        `@GoMarkeplace:products`,
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const storagedProducts = products.map(product => {
        return product.id === id && product.quantity > 1
          ? { ...product, quantity: product.quantity - 1 }
          : product;
      });

      setProducts(storagedProducts);

      await AsyncStorage.setItem(
        `@GoMarkeplace:products`,
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
