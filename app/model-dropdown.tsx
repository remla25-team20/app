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

export default function ModelDropdown() {
  const [items, setItems] = useState<{ key: string; label: string }[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>("");

  useEffect(() => {
    fetch("/api/models")
      .then((res) => res.json())
      .then(({ models }) => {
        const mapped = models.map((tag: string) => ({ key: tag, label: tag }));
        setItems(mapped);
        if (mapped.length) setSelectedKey(mapped[0].key);
      })
      .catch((err) => console.error(err));
  }, []);

  const selectedLabel =
    items.find((it) => it.key === selectedKey)?.label || "Select a model";

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="bordered">{selectedLabel}</Button>
      </DropdownTrigger>

      <DropdownMenu
        aria-label="Select a model version"
        items={items}
        onAction={(key) => setSelectedKey(key as string)}
      >
        {(item) => (
          <DropdownItem key={item.key}>
            {item.label}
          </DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}
