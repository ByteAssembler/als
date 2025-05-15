import { type MapPointType } from "@prisma/client";

interface CategorySelectorProps {
	types: MapPointType[];
	category: string;
	setCategory: (category: string) => void;
}

export default function CategorySelector({ types, category, setCategory }: CategorySelectorProps) {
	return (
		<div className="w-full max-w-lg mx-auto">
			<div className="relative">
				<select
					className="w-full p-3 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
					value={category}
					onChange={(e) => setCategory(e.target.value)}
				>
					<option value="" key="all">
						Alle Kategorien
					</option>
					{types.length > 0 &&
						types.map((type) => (
							<option key={type.id} value={type.name}>
								{type.name}
							</option>
						))}
				</select>
				<div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">▼</div>
			</div>
			<div id="map-map" className="h-[500px] w-full rounded-lg shadow-md mt-4 bg-gray-100"></div>
		</div>
	);
}
