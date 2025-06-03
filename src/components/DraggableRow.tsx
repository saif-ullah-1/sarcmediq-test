import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { DragItem, DraggableRowProps } from "../types/components";

const DraggableRow: React.FC<DraggableRowProps> = ({
  rule,
  index,
  moveRow,
  readOnly,
  isNewRule,
  isEditing,
  showValidation,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  handleFieldUpdate,
  handleComparatorChange,
}) => {
  const ref = useRef<HTMLTableRowElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: any }>({
    accept: "row",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();

      if (!clientOffset) {
        return;
      }

      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveRow(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag<
    DragItem,
    void,
    { isDragging: boolean }
  >({
    type: "row",
    item: () => {
      return { id: rule.id, index, type: "row" };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => !readOnly && !isEditing,
  });

  const opacity = isDragging ? 0.4 : 1;

  if (!readOnly && !isEditing) {
    preview(drop(ref));
    drag(dragHandleRef);
  }

  const shouldShowEditable = readOnly ? false : isNewRule || isEditing;

  const isFieldIncomplete = (fieldValue: string | undefined): boolean => {
    return Boolean(showValidation && (!fieldValue || fieldValue.trim() === ""));
  };

  const isUnitRequired = rule.comparator !== "is";
  const isUnitIncomplete: boolean =
    isUnitRequired && isFieldIncomplete(rule.unitName);

  const getInputClassName = (baseClass: string, isIncomplete: boolean) => {
    return `${baseClass} ${isIncomplete ? "border-red-500 bg-red-50" : ""}`;
  };

  return (
    <tr
      ref={ref}
      style={{ opacity }}
      data-handler-id={handlerId}
      className={`border-b border-gray-100 transition-colors ${
        isNewRule ? "bg-blue-50 hover:bg-blue-50" : "hover:bg-gray-50"
      }`}
    >
      {!readOnly && (
        <td className="py-2 sm:py-3 px-1 sm:px-2 text-gray-400">
          <div
            ref={dragHandleRef}
            className={`cursor-move text-sm sm:text-base ${
              isEditing ? "opacity-50 cursor-not-allowed" : ""
            }`}
            style={{ pointerEvents: isEditing ? "none" : "auto" }}
            title="Drag to reorder"
          >
            <span>≡≡</span>
          </div>
        </td>
      )}
      <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-500 text-xs sm:text-sm">
        {index + 1}
      </td>
      <td className="py-2 sm:py-3 px-2 sm:px-4">
        {shouldShowEditable ? (
          isNewRule ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <input
                type="text"
                value={rule.measurement}
                onChange={(e) =>
                  handleFieldUpdate(rule.id, "measurement", e.target.value)
                }
                className={getInputClassName(
                  "px-3 py-2 border-2 border-blue-300 rounded-md text-sm w-full sm:min-w-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                  isFieldIncomplete(rule.measurement)
                )}
                placeholder="Enter measurement name *"
              />
              <select
                value={rule.comparator}
                onChange={(e) =>
                  handleComparatorChange(rule.id, e.target.value)
                }
                className="px-3 py-2 border-2 border-blue-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="is">is</option>
                <option value=">=">&gt;=</option>
                <option value="<">&lt;</option>
              </select>
              {rule.comparator === "is" ? (
                <span className="text-gray-500 px-3 py-2 bg-gray-100 rounded-md text-sm">
                  Not Present
                </span>
              ) : (
                <>
                  <input
                    type="number"
                    value={rule.comparedValue}
                    onChange={(e) =>
                      handleFieldUpdate(
                        rule.id,
                        "comparedValue",
                        e.target.value
                      )
                    }
                    className="px-3 py-2 border-2 border-blue-300 rounded-md text-sm w-16 sm:w-20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <select
                    value={rule.unitName}
                    onChange={(e) =>
                      handleFieldUpdate(rule.id, "unitName", e.target.value)
                    }
                    className={getInputClassName(
                      "px-3 py-2 border-2 border-blue-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                      isUnitIncomplete
                    )}
                  >
                    <option value="" disabled>
                      Select Unit *
                    </option>
                    <option value="ms">ms</option>
                    <option value="mm">mm</option>
                    <option value="cm">cm</option>
                    <option value="s">s</option>
                  </select>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <input
                type="text"
                value={rule.measurement}
                onChange={(e) =>
                  handleFieldUpdate(rule.id, "measurement", e.target.value)
                }
                className={getInputClassName(
                  "px-2 py-1 border border-gray-300 rounded text-sm w-full sm:min-w-[120px] focus:outline-none focus:ring-1 focus:ring-blue-500",
                  isFieldIncomplete(rule.measurement)
                )}
                placeholder="Enter measurement name *"
              />
              <select
                value={rule.comparator}
                onChange={(e) =>
                  handleComparatorChange(rule.id, e.target.value)
                }
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="is">is</option>
                <option value=">=">&gt;=</option>
                <option value="<">&lt;</option>
              </select>
              {rule.comparator === "is" ? (
                <span className="text-gray-500 px-2 py-1 bg-gray-100 rounded text-sm">
                  Not Present
                </span>
              ) : (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={rule.comparedValue}
                    onChange={(e) =>
                      handleFieldUpdate(
                        rule.id,
                        "comparedValue",
                        e.target.value
                      )
                    }
                    className="px-2 py-1 border border-gray-300 rounded text-sm w-12 sm:w-16 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={rule.unitName}
                    onChange={(e) =>
                      handleFieldUpdate(rule.id, "unitName", e.target.value)
                    }
                    className={getInputClassName(
                      "px-2 py-1 border border-gray-300 rounded text-sm w-10 sm:w-12 focus:outline-none focus:ring-1 focus:ring-blue-500",
                      isUnitIncomplete
                    )}
                    placeholder="Unit *"
                  />
                </div>
              )}
            </div>
          )
        ) : (
          <div className="text-gray-700 text-sm">
            <span className="font-medium">{rule.measurement}</span>
            <span className="mx-1 sm:mx-2 text-gray-500">
              {rule.comparator}
            </span>
            <span className="text-gray-600">{rule.comparedValue}</span>
            {rule.comparator !== "is" && rule.unitName && (
              <span className="text-gray-600"> {rule.unitName}</span>
            )}
          </div>
        )}
      </td>
      <td className="py-2 sm:py-3 px-2 sm:px-4">
        {shouldShowEditable ? (
          <input
            type="text"
            value={rule.findingName}
            onChange={(e) =>
              handleFieldUpdate(rule.id, "findingName", e.target.value)
            }
            className={getInputClassName(
              `rounded-md text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isNewRule
                  ? "px-3 py-2 border-2 border-blue-300 focus:border-blue-500"
                  : "px-2 py-1 border border-gray-300"
              }`,
              isFieldIncomplete(rule.findingName)
            )}
            placeholder="Enter Findings name *"
          />
        ) : (
          <span className="text-gray-700 text-sm">{rule.findingName}</span>
        )}
      </td>
      <td className="py-2 sm:py-3 px-2 sm:px-4">
        {shouldShowEditable ? (
          <select
            value={rule.action || ""}
            onChange={(e) =>
              handleFieldUpdate(rule.id, "action", e.target.value)
            }
            className={getInputClassName(
              `rounded-md text-sm bg-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isNewRule
                  ? "px-3 py-2 border-2 border-blue-300 focus:border-blue-500"
                  : "px-2 py-1 border border-gray-300"
              }`,
              isFieldIncomplete(rule.action)
            )}
          >
            <option value="" disabled>
              Select Action *
            </option>
            <option value="Normal">Select "Not visualized"</option>
            <option value="Reflux">Select "Reflux"</option>
          </select>
        ) : (
          <div className="text-gray-700 text-sm">
            <span className="font-semibold text-gray-900">Select</span>
            <span className="text-gray-500">
              " {rule.action === "Normal" ? "Not visualized" : rule.action}"
            </span>
          </div>
        )}
      </td>
      {!readOnly && (
        <>
          <td className="py-2 sm:py-3 px-2 sm:px-4">
            {isEditing ? (
              <div className="flex gap-1">
                <button
                  onClick={() => onSaveEdit(rule.id)}
                  className="text-green-600 hover:text-green-800 font-medium cursor-pointer text-sm sm:text-base"
                  title="Save changes"
                >
                  ✓
                </button>
                <button
                  onClick={() => onCancelEdit(rule.id)}
                  className="text-gray-600 hover:text-gray-800 font-medium cursor-pointer text-sm sm:text-base"
                  title="Cancel edit"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => onStartEdit(rule.id)}
                className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer text-sm sm:text-base"
                title="Edit rule"
              >
                ✏️
              </button>
            )}
          </td>
          <td className="py-2 sm:py-3 px-2 sm:px-4">
            <button
              onClick={() => onDelete && onDelete(rule.id)}
              className="text-red-600 hover:text-red-800 font-medium cursor-pointer text-sm sm:text-base"
              title="Delete rule"
            >
              🗑️
            </button>
          </td>
        </>
      )}
    </tr>
  );
};

export default DraggableRow;
