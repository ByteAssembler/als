// src/components/Admin.tsx
import { useState } from "react";
import Sidebars from "./Sidebars";
import SectionEditor from "./SectionEditor";

function Admin() {
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null,
  );

  return (
    <>
      <Sidebars
        selectedSiteId={selectedSiteId}
        onSectionSelect={setSelectedSectionId}
        selectedSectionId={selectedSectionId}
        onSiteSelect={setSelectedSiteId} // Wichtig: Event-Handler weitergeben
      />
      <div className="flex-1">
        <SectionEditor selectedSectionId={selectedSectionId} />
      </div>
    </>
  );
}

export default Admin;
