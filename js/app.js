// app.js - Full Refactored Version with Fixed Select-All & PDF, and dynamic footer loading

document.addEventListener("DOMContentLoaded", () => {
	// --- Global DOM Elements ---
	const truckTabs = document.getElementById("truck-tabs");
	const truckNumberInput = document.getElementById("truck-number-input");
	const checklistContainer = document.getElementById("checklist-container");
	const form = document.getElementById("checklist-form");
	const selectAllBtn = document.getElementById("select-all-btn");
	const exportBtn = document.getElementById("export-pdf");

	// Placeholder for dynamic content
	const navPlaceholder = document.getElementById("nav-placeholder");
	const footerPlaceholder = document.getElementById("footer-placeholder");

	const DEFAULT_TRUCK_ID = 341;
	let selectedTruck = null;

	// --- Load Navigation Bar ---
	if (navPlaceholder) {
		fetch("nav.html")
			.then((res) => {
				if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
				return res.text();
			})
			.then((html) => {
				navPlaceholder.innerHTML = html;
				const currentPath =
					window.location.pathname.split("/").pop() || "hub.html"; // Defaulting to hub.html
				navPlaceholder.querySelectorAll("a").forEach((link) => {
					if (link.getAttribute("href").split("/").pop() === currentPath) {
						link.classList.add("bg-gray-950/50", "text-white");
					}
				});
			})
			.catch((err) => console.error("Nav load error:", err));
	}

	// --- Load Footer (Dynamically added as requested) ---
	if (footerPlaceholder) {
		fetch("footer.html")
			.then((res) => {
				if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
				return res.text();
			})
			.then((html) => {
				footerPlaceholder.innerHTML = html;
			})
			.catch((err) => console.error("Footer load error:", err));
	}

	// --- Load Checklist ---
	function loadChecklist(jsonFile) {
		if (!checklistContainer) return;
		checklistContainer.innerHTML = "";

		fetch(jsonFile)
			.then((res) => {
				if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
				return res.json();
			})
			.then((data) => {
				data.sections.forEach((section) => {
					const sectionDiv = document.createElement("div");
					sectionDiv.classList.add(
						"mb-6",
						"p-4",
						"border",
						"border-gray-200",
						"rounded-xl",
						"bg-white",
						"shadow-sm"
					);

					const title = document.createElement("h3");
					title.textContent = section.title;
					title.classList.add(
						"font-extrabold",
						"mb-3",
						"text-xl",
						"uppercase",
						"text-gray-600",
						"pb-2",
						"border-b"
					);
					sectionDiv.appendChild(title);

					section.items.forEach((item) => {
						const itemDiv = document.createElement("div");
						// Applying the new checklist-item class here
						itemDiv.classList.add(
							"checklist-item",
							"flex",
							"items-center",
							"py-3",
							"px-3",
							"mb-1",
							"gap-4",
							"flex-wrap",
							"border-b",
							"border-gray-100",
							"rounded"
						);

						const label = document.createElement("label");
						label.classList.add(
							"flex",
							"items-center",
							"gap-3",
							"cursor-pointer"
						);

						const checkbox = document.createElement("input");
						checkbox.type = "checkbox";
						checkbox.dataset.section = section.title;
						checkbox.dataset.item = item;
						checkbox.dataset.timestamp = "";
						checkbox.classList.add(
							"w-5",
							"h-5",
							"text-green-600",
							"bg-gray-100",
							"border-gray-300",
							"rounded",
							"focus:ring-green-500"
						);

						checkbox.addEventListener("change", function () {
							this.dataset.timestamp = this.checked
								? new Date().toISOString()
								: "";
						});

						const itemText = document.createElement("span");
						itemText.textContent = item;
						itemText.classList.add("font-medium", "text-gray-700");

						label.appendChild(checkbox);
						label.appendChild(itemText);

						// Icon to visually separate item and notes
						const separatorIcon = document.createElement("i");
						separatorIcon.classList.add(
							"fa-solid",
							"fa-arrow-right",
							"text-gray-300",
							"hidden",
							"sm:block"
						);

						const notesInput = document.createElement("input");
						notesInput.type = "text";
						notesInput.placeholder = "Defect Notes / Maintenance Required...";
						notesInput.dataset.section = section.title;
						notesInput.dataset.item = item;
						notesInput.classList.add(
							"flex-1",
							"border",
							"border-gray-300",
							"rounded-lg",
							"px-3",
							"py-1",
							"text-sm",
							"hover:border-blue-400",
							"focus:outline-none",
							"focus:ring-2",
							"focus:ring-blue-300",
							"min-w-40" // Ensure notes field is usable on mobile
						);

						itemDiv.appendChild(label);
						itemDiv.appendChild(separatorIcon);
						itemDiv.appendChild(notesInput);
						sectionDiv.appendChild(itemDiv);
					});

					checklistContainer.appendChild(sectionDiv);
				});
			})
			.catch((err) => {
				checklistContainer.innerHTML = `<p class="text-red-500 italic p-6">Error loading checklist: ${err.message}. Make sure the truck JSON file exists.</p>`;
				console.error("Checklist load error:", err);
			});
	}

	// --- Truck Tabs ---
	function handleTruckTabClick(truckId, currentTab) {
		if (!truckTabs) return;
		truckTabs.querySelectorAll("button").forEach((b) => {
			// Updated styling for unselected tabs
			b.classList.remove("bg-gray-600", "text-white", "shadow-lg");
			b.classList.add("bg-gray-200", "text-gray-700");
		});

		// Updated styling for selected tab
		currentTab.classList.remove("bg-gray-200", "text-gray-700");
		currentTab.classList.add("bg-gray-600", "text-white", "shadow-lg");

		selectedTruck = truckId;
		if (truckNumberInput) truckNumberInput.value = selectedTruck;

		loadChecklist(`./truck${truckId}.json`);
	}

	function initializeTruckTabs() {
		if (!truckTabs) return;
		fetch("./trucks.json")
			.then((res) => {
				if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
				return res.json();
			})
			.then((data) => {
				let defaultTab = null;
				data.trucks.forEach((truck) => {
					const tab = document.createElement("button");
					tab.textContent = truck.name;
					tab.classList.add(
						"px-5",
						"py-2",
						"rounded-full",
						"bg-gray-200",
						"text-gray-700",
						"hover:bg-gray-300",
						"font-semibold",
						"transition-colors",
						"duration-150"
					);
					if (truck.id === DEFAULT_TRUCK_ID) defaultTab = tab;
					tab.addEventListener("click", () =>
						handleTruckTabClick(truck.id, tab)
					);
					truckTabs.appendChild(tab);
				});
				if (defaultTab) handleTruckTabClick(DEFAULT_TRUCK_ID, defaultTab);
			})
			.catch((err) => console.error("Truck tabs load error:", err));
	}

	// --- Form Submit ---
	function handleFormSubmit(e) {
		e.preventDefault();
		const inspectorName = document
			.getElementById("inspector-name")
			?.value.trim();

		if (!selectedTruck) {
			console.log("Validation Failed: Please select a truck first!");
			return;
		}

		if (!inspectorName) {
			console.log("Validation Failed: Inspector Name is required!");
			// In a real app, show a modal or error message on the page instead of just console logging
			document.getElementById("inspector-name").focus();
			return;
		}

		const inspector = inspectorName || "Unknown";
		const results = {};

		checklistContainer
			.querySelectorAll("input[type='checkbox']")
			.forEach((cb) => {
				const section = cb.dataset.section;
				const item = cb.dataset.item;
				const notes =
					cb.closest(".checklist-item").querySelector("input[type='text']")
						?.value || "";
				if (!results[section]) results[section] = {};
				results[section][item] = {
					status: cb.checked ? "OK" : "Defect",
					checkTimestamp: cb.dataset.timestamp || null,
					notes,
				};
			});

		const inspection = {
			truckNumber: selectedTruck,
			inspector,
			timestamp: new Date().toISOString(),
			results,
		};

		try {
			// Using localStorage as per existing implementation, though Firebase/Firestore is recommended for real persistence.
			const inspections = JSON.parse(
				localStorage.getItem("inspections") || "[]"
			);
			inspections.push(inspection);
			localStorage.setItem("inspections", JSON.stringify(inspections));

			console.log(`Inspection for Truck ${selectedTruck} saved successfully!`);

			// Optional: Show success message/modal here instead of silent save

			form.reset();
			// Re-select the truck and reload the checklist after reset
			handleTruckTabClick(
				selectedTruck,
				truckTabs.querySelector(
					`button:nth-child(${
						data.trucks.findIndex((t) => t.id === selectedTruck) + 1
					})`
				)
			);
		} catch (err) {
			console.error(err);
			console.log("Failed to save inspection.");
		}
	}

	// --- Select All Button ---
	if (selectAllBtn && checklistContainer) {
		selectAllBtn.addEventListener("click", () => {
			checklistContainer
				.querySelectorAll("input[type='checkbox']")
				.forEach((cb) => {
					cb.checked = true;
					cb.dataset.timestamp = new Date().toISOString();
					// Manually trigger the checklist-item styling update
					cb.closest(".checklist-item").classList.add(
						'checklist-item:has(input[type="checkbox"]:checked)'
					);
				});
		});
	}

	// --- PDF Export ---
	function exportPDF() {
		if (!checklistContainer) return;
		const { jsPDF } = window.jspdf;
		const pdf = new jsPDF();
		let y = 10;

		const inspector =
			document.getElementById("inspector-name")?.value || "Unknown";
		const truck = truckNumberInput?.value || "N/A";
		const timestamp = new Date().toLocaleString();

		pdf.setFontSize(16);
		pdf.text("Truck Inspection Report", 10, y);
		y += 8;
		pdf.setFontSize(12);
		pdf.text(`Truck Number: ${truck}`, 10, y);
		y += 6;
		pdf.text(`Inspector: ${inspector}`, 10, y);
		y += 6;
		pdf.text(`Date: ${timestamp}`, 10, y);
		y += 10;

		checklistContainer.querySelectorAll(".mb-6").forEach((sectionDiv) => {
			const title = sectionDiv.querySelector("h3")?.textContent || "Section";
			pdf.setFontSize(14);
			pdf.text(title, 10, y);
			y += 7;

			sectionDiv.querySelectorAll(".checklist-item").forEach((item) => {
				const checkbox = item.querySelector("input[type='checkbox']");
				const notes = item.querySelector("input[type='text']")?.value || "";
				const label = checkbox?.dataset.item || "";
				const status = checkbox?.checked ? "OK" : "Defect";

				let time = "—";
				if (checkbox?.dataset.timestamp) {
					const parsed = Date.parse(checkbox.dataset.timestamp);
					if (!isNaN(parsed)) time = new Date(parsed).toLocaleString();
				}

				pdf.setFontSize(11);
				pdf.text(`• ${label} - ${status}`, 12, y);
				y += 5;

				if (notes.trim()) {
					pdf.setFontSize(10);
					pdf.text(`   Notes: ${notes}`, 12, y);
					y += 5;
				}

				pdf.setFontSize(10);
				pdf.text(`   Time: ${time}`, 12, y);
				y += 6;

				if (y > 270) {
					pdf.addPage();
					y = 10;
				}
			});

			y += 5;
		});

		pdf.save(`Truck_${truck}_Inspection.pdf`);
	}

	if (exportBtn) exportBtn.addEventListener("click", exportPDF);

	// --- Initialization ---
	if (checklistContainer && truckTabs && form) {
		initializeTruckTabs();
		form.addEventListener("submit", handleFormSubmit);
	}
});
