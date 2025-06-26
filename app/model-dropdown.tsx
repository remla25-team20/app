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

// base url
const baseUrl = "/model-service";

export default function ModelDropdown({
  selectedModel,
  onChange,
}: {
  selectedModel: string;
  onChange: (version: string) => void;
}) {
  const [items, setItems] = useState<{ key: string; label: string }[]>([]);

  useEffect(() => {
    const fetchModelVersions = () => {
      console.log("[ModelDropdown] fetching model list…");
      fetch(`${baseUrl}/model-versions`)
        .then((res) => {
          console.log(`[ModelDropdown] ${baseUrl}/model-versions response:`, res.status);
          return res.json();
        })
        .then(({ modelVersions }) => {
          console.log("[ModelDropdown] modelVersions payload:", modelVersions);
          const mapped = modelVersions.map((tag: string) => ({ key: tag, label: tag }));
          setItems(mapped);
          if (mapped.length > 0) {
            onChange(mapped[0].key);
          } else {
            // try again if model-service didn't get to download any models yet
            console.log("[ModelDropdown] /model-versions returned empty list; will query again in 3s")
            setTimeout(fetchModelVersions, 3_000)
          }
        })
        .catch((err) =>
          console.error("[ModelDropdown] fetch models failed:", err)
        );
    };
    fetchModelVersions();
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
