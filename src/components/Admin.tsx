// src/components/Admin.tsx
import { useState } from "react";
import Sidebars from "./Sidebars";
import SectionEditor from "./SectionEditor";
import type { Section } from "@prisma/client";




function Admin() {
    const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
        null,
    );

    return (
        <div className="flex">
            <Sidebars
                selectedSiteId={selectedSiteId}
                onSiteSelect={setSelectedSiteId} // Wichtig: Event-Handler weitergeben
                selectedSectionId={selectedSectionId}
                onSectionSelect={setSelectedSectionId}

            />
            <div className="flex-1">
                <SectionEditor selectedSectionId={selectedSectionId} />
            </div>
        </div>
    );
}

export default Admin;
