import { useState } from "react";

interface ExpandableListProps {
  items: string[];
  maxLength?: number;
}

const ExpandableList = ({ items, maxLength = 3 }: ExpandableListProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    if (!items || items.length === 0) return null;
    
    const hasMore = items.length > maxLength;
    const displayedItems = isExpanded ? items : items.slice(0, maxLength);

    return (
        <div className="text-xs leading-relaxed max-w-64">
            {displayedItems.map((item, index) => (
                <span key={index} className="text-base-content">
                    {item}
                    {index < displayedItems.length - 1 && ", "}
                </span>
            ))}
            {hasMore && (
                <button
                    className = "inline-block text-primary hover:underline font-bold ml-1 cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }}
                >
                    {isExpanded ? " (show less)" : "..."}
                </button>
            )}
        </div>
    )
}

export default ExpandableList;