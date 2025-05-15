// src/components/Admin.tsx
import { useState } from "react";
import Sidebars from "./Sidebars";
import SectionEditor from "./SectionEditor";
import type { Section } from "@prisma/client";

function Admin() {
	const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
	const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

	return (
		<div className="flex">
			<div className="fixed w-64">
				<Sidebars
					selectedSiteId={selectedSiteId}
					onSiteSelect={setSelectedSiteId} // Wichtig: Event-Handler weitergeben
					selectedSectionId={selectedSectionId}
					onSectionSelect={setSelectedSectionId}
				/>
			</div>
			<div className="flex-1 ml-64">
				<SectionEditor selectedSectionId={selectedSectionId} />
			</div>
		</div>
	);
}

export default Admin;
