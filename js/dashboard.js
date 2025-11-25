document.addEventListener("DOMContentLoaded", () => {
	// --- Load navigation bar dynamically ---
	const navPlaceholder = document.getElementById("nav-placeholder");
	const footerPlaceholder = document.getElementById("footer-placeholder"); // Define footer placeholder

	if (navPlaceholder) {
		fetch("nav.html")
			.then((res) => (res.ok ? res.text() : ""))
			.then((html) => {
				navPlaceholder.innerHTML = html;

				// Highlight current page
				const currentPath =
					window.location.pathname.split("/").pop() || "index.html";
				navPlaceholder.querySelectorAll("a").forEach((link) => {
					const linkHref = link.getAttribute("href").split("/").pop();
					if (linkHref === currentPath) {
						link.classList.add("bg-gray-950/50", "text-white", "font-bold");
					} else {
						link.classList.remove("bg-gray-950/50", "text-white", "font-bold");
					}
				});
			})
			.catch((err) => console.error("Failed to load nav:", err));
	}

	// --- Load Footer dynamically ---
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

	// --- Load inspections from LocalStorage ---
	let inspections = JSON.parse(localStorage.getItem("inspections")) || [];

	// Sort by timestamp descending
	inspections.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

	const ctx = document.getElementById("inspectionChart");
	if (!ctx) return;

	if (inspections.length === 0) {
		document.getElementById("no-data-message").textContent =
			"No inspections saved yet.";
		return;
	}

	// --- Prepare data for table and chart ---
	const labels = [];
	const okCounts = [];
	const defectCounts = [];
	let totalOk = 0;
	let totalDefects = 0;

	const tbody = document.getElementById("summary-table-body");

	inspections.forEach((i) => {
		let ok = 0,
			defects = 0;
		Object.values(i.results).forEach((section) =>
			Object.values(section).forEach((item) => {
				if (item.status === "OK") ok++;
				else if (item.status === "Defect") defects++;
			})
		);
		okCounts.push(ok);
		defectCounts.push(defects);
		labels.push(`Truck ${i.truckNumber}`);

		totalOk += ok;
		totalDefects += defects;

		// Add row to summary table including Date/Time
		const row = document.createElement("tr");
		row.innerHTML = `
          <td class="border px-4 py-2">${i.truckNumber}</td>
          <td class="border px-4 py-2">${ok}</td>
          <td class="border px-4 py-2">${defects}</td>
          <td class="border px-4 py-2">${new Date(
						i.timestamp
					).toLocaleString()}</td>
        `;
		tbody.appendChild(row);
	});

	// Update totals row
	document.getElementById("total-ok").textContent = totalOk;
	document.getElementById("total-defects").textContent = totalDefects;

	// --- Create chart ---
	new Chart(ctx, {
		type: "bar",
		data: {
			labels,
			datasets: [
				{ label: "OK", data: okCounts, backgroundColor: "rgba(0,255,0,0.5)" },
				{
					label: "Defect",
					data: defectCounts,
					backgroundColor: "rgba(255,0,132,0.5)",
				},
			],
		},
		options: {
			responsive: true,
			plugins: { legend: { position: "top" } },
			scales: { y: { beginAtZero: true } },
		},
	});
});
