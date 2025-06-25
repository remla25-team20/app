// app/model-dropdown.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@heroui/react";

export default function ModelDropdown({
  selectedModel,
  onChange,
}: {
  selectedModel: string;
  onChange: (version: string) => void;
}) {
  const [items, setItems] = useState<{ key: string; label: string }[]>([]);

  useEffect(() => {
    console.log("[ModelDropdown] fetching model list…");
    fetch("api/models")
      .then((res) => {
        console.log("[ModelDropdown] /api/models response:", res.status);
        return res.json();
      })
      .then(({ models }) => {
        console.log("[ModelDropdown] models payload:", models);
        const mapped = models.map((tag: string) => ({ key: tag, label: tag }));
        setItems(mapped);
        if (mapped.length) {
          onChange(mapped[0].key);
        }
      })
      .catch((err) =>
        console.error("[ModelDropdown] fetch models failed:", err)
      );
  }, []);

  const selectedLabel =
    items.find((it) => it.key === selectedModel)?.label || "Select a model";

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="bordered">{selectedLabel}</Button>
      </DropdownTrigger>

      <DropdownMenu
        aria-label="Select a model version"
        items={items}
        onAction={(key) => {
          const version = key as string;
          onChange(version);
          console.log("[ModelDropdown] user selected version:", version);
        }}
      >
        {(item) => (
          <DropdownItem key={item.key}>{item.label}</DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}
