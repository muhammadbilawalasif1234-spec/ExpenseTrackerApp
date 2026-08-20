import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export type Transaction = {
  id: number;
  type: "income" | "expense";
  amount: number;
  category: string;
  date: string;
};

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadTransactions();
  }, []);
  useEffect(() => {
    saveTransactions();
  }, [transactions]);

  const saveTransactions = async () => {
    await AsyncStorage.setItem("transactions", JSON.stringify(transactions));
  };
  const loadTransactions = async () => {
    const data = await AsyncStorage.getItem("transactions");
    if (data) setTransactions(JSON.parse(data));
  };

  const addTransaction = (newTx: Omit<Transaction, "id">) => {
    setTransactions([{ id: Date.now(), ...newTx }, ...transactions]);
  };

  const deleteTransaction = (id: number) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  return { transactions, addTransaction, deleteTransaction };
};
