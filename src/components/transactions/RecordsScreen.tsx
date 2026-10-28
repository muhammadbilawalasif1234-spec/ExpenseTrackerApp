import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  ChevronDown,
  Calendar as CalendarIcon,
  ShoppingBag,
  CreditCard,
  Tag,
  Coffee,
  Plane,
  HeartPulse,
  Briefcase,
  Check,
  Trash2,
} from "lucide-react";
import { Currency, Transaction, Account } from "../../types";

export interface RecordsScreenProps {
  transactions: Transaction[];
  currency?: Currency;
  accounts?: Account[];
  onAddNewClick: () => void;
  onDeleteTransaction?: (id: string) => void;
  onBack?: () => void;
  isLight?: boolean;
}

export const RecordsScreen: React.FC<RecordsScreenProps> = ({
  transactions,
  accounts = [],
  onAddNewClick,
  onDeleteTransaction,
  isLight = true,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [swipedItemId, setSwipedItemId] = useState<string | null>(null);

  // Filtered transactions based on search
  const filteredTransactions = useMemo(() => {
    let list = transactions;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter((tx) => {
        const cat = tx.category.toLowerCase();
        const note = (tx.note || "").toLowerCase();
        const amt = tx.amount.toString();
        return (
          cat.includes(query) || note.includes(query) || amt.includes(query)
        );
      });
    }

    return [...list].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [transactions, searchQuery]);

  // Group filtered transactions by readable date
  const groupedTransactions = useMemo(() => {
    const groups: { dateHeader: string; items: Transaction[] }[] = [];
    const map = new Map<string, Transaction[]>();

    filteredTransactions.forEach((tx) => {
      const d = new Date(tx.date);
      const header = d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      if (!map.has(header)) {
        map.set(header, []);
      }
      map.get(header)!.push(tx);
    });

    map.forEach((items, dateHeader) => {
      groups.push({ dateHeader, items });
    });

    return groups;
  }, [filteredTransactions]);

  const getAccountLabel = (item: Transaction) => {
    if (accounts && accounts.length > 0 && item.accountId) {
      const found = accounts.find((a) => a.id === item.accountId);
      if (found) return found.name;
    }
    if (item.note && item.note.trim()) {
      return item.note;
    }
    return item.type === "income" ? "Cash" : "Credit Card";
  };

  const formatItemDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const renderCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (
      cat.includes("shopping") ||
      cat.includes("mall") ||
      cat.includes("cloth")
    ) {
      return (
        <div className="w-10 h-10 rounded-[12px] bg-[#FFF7E8] text-[#D97706] flex items-center justify-center shrink-0">
          <ShoppingBag size={18} strokeWidth={2} />
        </div>
      );
    }
    if (
      cat.includes("salary") ||
      cat.includes("income") ||
      cat.includes("earn")
    ) {
      return (
        <div className="w-10 h-10 rounded-[12px] bg-[#EAFBF3] text-[#10B981] flex items-center justify-center shrink-0">
          <CreditCard size={18} strokeWidth={2} />
        </div>
      );
    }
    if (
      cat.includes("vacation") ||
      cat.includes("travel") ||
      cat.includes("flight") ||
      cat.includes("trip")
    ) {
      return (
        <div className="w-10 h-10 rounded-[12px] bg-[#FDF2F2] text-[#EF4444] flex items-center justify-center shrink-0">
          <ShoppingBag size={18} strokeWidth={2} />
        </div>
      );
    }
    if (
      cat.includes("coffee") ||
      cat.includes("cafe") ||
      cat.includes("food") ||
      cat.includes("restaurant")
    ) {
      return (
        <div className="w-10 h-10 rounded-[12px] bg-[#FFF7ED] text-[#F97316] flex items-center justify-center shrink-0">
          <Coffee size={18} strokeWidth={2} />
        </div>
      );
    }
    if (cat.includes("invest") || cat.includes("business")) {
      return (
        <div className="w-10 h-10 rounded-[12px] bg-[#F0FDFA] text-[#14B8A6] flex items-center justify-center shrink-0">
          <Briefcase size={18} strokeWidth={2} />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-[12px] bg-[#F1F5F9] text-[#64748B] flex items-center justify-center shrink-0">
        <Tag size={18} strokeWidth={2} />
      </div>
    );
  };

  return (
    <div
      className={`pb-3 w-full flex-1 flex flex-col items-center select-none ${isLight ? "bg-white" : "bg-[#0D1117]"}`}
    >
      {/* Records screen title bar: width: 412, height: 76, angle: 0 deg, opacity: 1, border-bottom-width: 1px, padding-top: 16px, gap: 10px */}
      <div
        id="records-screen-title-bar"
        style={{
          width: "100%",
          maxWidth: "412px",
          height: "76px",
          transform: "rotate(0deg)",
          opacity: 1,
          borderBottomWidth: "1px",
          paddingTop: "16px",
          paddingLeft: "16px",
          paddingRight: "16px",
          gap: "10px",
        }}
        className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0"
      >
        <h1
          className="text-[24px] font-bold tracking-tight text-[#002F52] dark:text-white"
          style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
        >
          Records
        </h1>

        <button
          onClick={onAddNewClick}
          id="records-add-btn"
          className="w-[38px] h-[38px] rounded-full bg-[#002F52] hover:bg-[#022135] text-white flex items-center justify-center shadow-sm cursor-pointer transition-transform active:scale-95"
          title="Add Record"
        >
          <Plus size={20} strokeWidth={2.4} />
        </button>
      </div>

      {/* Main Content Area */}
      <div
        className="w-full flex flex-col items-center pt-4 px-4"
        style={{ maxWidth: "412px" }}
      >
        {/* Records screen search bar */}
        <div
          id="records-screen-search-bar"
          style={{
            width: "100%",
            maxWidth: "380px",
            height: "48px",
            borderRadius: "12px",
            gap: "10px",
            padding: "10px 14px",
            transform: "rotate(0deg)",
            opacity: 1,
          }}
          className="flex items-center bg-[#F1F4F9] dark:bg-[#161B22] mb-4"
        >
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search Record"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-[13px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none border-0 p-0 ml-2"
          />
        </div>

        {/* Records List Container */}
        <div
          className="flex flex-col w-full items-center"
          style={{ maxWidth: "380px" }}
        >
          {groupedTransactions.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <CalendarIcon size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  No records found
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  No transactions recorded for this period.
                </p>
              </div>
              <button
                onClick={onAddNewClick}
                className="px-3.5 py-1.5 rounded-lg bg-[#012E4F] hover:bg-[#022135] text-white text-[11px] font-semibold cursor-pointer transition-all shadow-xs"
              >
                + Add Record
              </button>
            </div>
          ) : (
            groupedTransactions.map((group, gIdx) => (
              <div key={gIdx} className="mb-4">
                {/* Records screen _separator properties: width: 340, height: 1, angle: 0 deg, opacity: 1, background: #FFFFFF0D */}
                {gIdx > 0 && (
                  <div
                    id={`records-separator-${gIdx}`}
                    style={{
                      width: 340,
                      height: 1,
                      transform: "rotate(0deg)",
                      opacity: 1,
                      backgroundColor: isLight ? "#0000000D" : "#FFFFFF0D",
                    }}
                    className="mb-2"
                  />
                )}

                {/* Records screen date properties: width: 340, height: 28.000001907348633, justify-content: space-between, angle: 0 deg, opacity: 1 */}
                <div
                  id={`records-date-header-${gIdx}`}
                  style={{
                    width: 340,
                    height: 28,
                    justifyContent: "space-between",
                    transform: "rotate(0deg)",
                    opacity: 1,
                  }}
                  className="flex items-center text-[12.5px] font-normal text-slate-500 dark:text-slate-400 mb-1"
                >
                  <span>{group.dateHeader}</span>
                </div>

                {/* Records Items */}
                <div className="flex flex-col gap-2.5">
                  {group.items.map((item) => {
                    const isIncome = item.type === "income";
                    const accountLabel = getAccountLabel(item);
                    const itemFormattedDate = formatItemDate(item.date);
                    const isSwiped = swipedItemId === item.id;

                    return (
                      <div
                        key={item.id}
                        className="relative overflow-hidden"
                        style={{ width: 340, height: 44, borderRadius: 10 }}
                      >
                        {/* Red delete button behind matching screenshot */}
                        {onDeleteTransaction && (
                          <div
                            className="absolute right-0 top-0 bottom-0 w-11 bg-[#DC2626] rounded-[10px] flex items-center justify-center cursor-pointer text-white hover:bg-red-700 transition-all z-0"
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Are you sure you want to delete this record?",
                                )
                              ) {
                                onDeleteTransaction(item.id);
                              }
                            }}
                          >
                            <Trash2 size={18} strokeWidth={2} />
                          </div>
                        )}

                        {/* Records screen Data card properties: width: 340, height: 44, justify-content: space-between, angle: 0 deg, opacity: 1 */}
                        <div
                          id={`record-card-${item.id}`}
                          style={{
                            width: 340,
                            height: 44,
                            justifyContent: "space-between",
                            transform: isSwiped
                              ? "translateX(-48px)"
                              : "rotate(0deg)",
                            opacity: 1,
                            transition: "transform 0.2s ease",
                          }}
                          onClick={() => {
                            if (onDeleteTransaction) {
                              setSwipedItemId(isSwiped ? null : item.id);
                            }
                          }}
                          className={`relative z-10 flex items-center justify-between cursor-pointer ${
                            isLight ? "bg-white" : "bg-[#0D1117]"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {renderCategoryIcon(item.category)}
                            <div className="min-w-0">
                              <div className="text-[13.5px] font-semibold text-slate-900 dark:text-white truncate leading-tight">
                                {item.category}
                              </div>
                              <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate leading-tight mt-0.5">
                                {accountLabel}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0 pl-2">
                            <div
                              className={`text-[13.5px] font-semibold leading-tight ${
                                isIncome ? "text-[#10B981]" : "text-[#EF4444]"
                              }`}
                            >
                              {item.amount.toFixed(2)}
                            </div>
                            <div className="text-[10.5px] text-slate-400 dark:text-slate-500 leading-tight mt-0.5">
                              {itemFormattedDate}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
