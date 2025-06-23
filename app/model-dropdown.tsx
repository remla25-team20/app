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
          setSelectedKey(mapped[0].key);
        }
      })
      .catch((err) =>
        console.error("[ModelDropdown] fetch models failed:", err)
      );
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
        onAction={(key) => {
          const version = key as string;
          setSelectedKey(version);
          console.log("[ModelDropdown] user selected version:", version);

          fetch("api/version", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ version }),
          })
            .then((res) => {
              console.log(
                "[ModelDropdown] POST /api/version status:",
                res.status
              );
              return res.json();
            })
            .then((json) =>
              console.log("[ModelDropdown] POST response body:", json)
            )
            .catch((err) =>
              console.error("[ModelDropdown] publish version failed:", err)
            );
        }}
      >
        {(item) => (
          <DropdownItem key={item.key}>{item.label}</DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}
