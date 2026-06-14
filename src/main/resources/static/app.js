const imageBaseUrl = "https://image.tmdb.org/t/p/w500";
const fallbackText = "Sin imagen";

const resultsElement = document.querySelector("#results");
const resultsTitleElement = document.querySelector("#results-title");
const statusElement = document.querySelector("#status");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const searchType = document.querySelector("#search-type");
const filterButtons = document.querySelectorAll(".filter-button");
const detailDialog = document.querySelector("#detail-dialog");
const detailContent = document.querySelector("#detail-content");
const closeDialog = document.querySelector("#close-dialog");

const inactiveFilterClasses = ["border", "border-zinc-800", "bg-zinc-950", "text-zinc-400", "hover:border-zinc-700", "hover:text-zinc-100"];
const activeFilterClasses = ["border", "border-white", "bg-white", "text-black"];
const posterClasses = "block aspect-[2/3] w-full bg-zinc-950 object-cover";
const detailPosterClasses = "w-full rounded-lg border border-zinc-800 bg-zinc-950 object-cover";
const chipClasses = "rounded-full border border-zinc-800 bg-black px-3 py-1 text-xs text-zinc-400";
const errorClasses = "rounded-lg border border-red-950 bg-red-950/20 p-5 text-sm text-red-300";

function escapeHtml(value) {
	return String(value ?? "")
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll("\"", "&quot;")
		.replaceAll("'", "&#039;");
}

function titleOf(item) {
	return item.title || item.name || "Sin titulo";
}

function dateOf(item) {
	return item.release_date || item.first_air_date || "";
}

function typeOf(item) {
	if (item.media_type === "tv") {
		return "Serie";
	}
	if (item.media_type === "movie") {
		return "Pelicula";
	}
	return item.first_air_date ? "Serie" : "Pelicula";
}

function mediaTypeOf(item) {
	return item.media_type || (item.first_air_date ? "tv" : "movie");
}

function posterMarkup(path, alt, className = posterClasses) {
	if (!path) {
		return `<div class="${className} grid place-items-center border border-zinc-900 text-sm text-zinc-600">${fallbackText}</div>`;
	}
	return `<img class="${className}" src="${imageBaseUrl}${path}" alt="${escapeHtml(alt)}">`;
}

function setActiveFilter(activeButton) {
	filterButtons.forEach((button) => {
		button.classList.remove(...activeFilterClasses);
		button.classList.add(...inactiveFilterClasses);
	});
	activeButton.classList.remove(...inactiveFilterClasses);
	activeButton.classList.add(...activeFilterClasses);
}

function setLoading(message) {
	statusElement.textContent = message;
	resultsElement.innerHTML = `<div class="col-span-full rounded-lg border border-zinc-900 bg-zinc-950 p-8 text-center text-sm text-zinc-500">${escapeHtml(message)}</div>`;
}

function setError(message) {
	statusElement.textContent = "";
	resultsElement.innerHTML = `<div class="col-span-full ${errorClasses}">${escapeHtml(message)}</div>`;
}

async function fetchJson(url) {
	const response = await fetch(url);
	const data = await response.json();
	if (!response.ok) {
		throw new Error(data.error || "No se pudo cargar la informacion.");
	}
	return data;
}

function renderResults(items) {
	const visibleItems = items.filter((item) => item.media_type !== "person");
	statusElement.textContent = `${visibleItems.length} resultados`;

	if (visibleItems.length === 0) {
		resultsElement.innerHTML = `<div class="col-span-full ${errorClasses}">No hay resultados para mostrar.</div>`;
		return;
	}

	resultsElement.innerHTML = visibleItems.map((item) => {
		const title = titleOf(item);
		const mediaType = mediaTypeOf(item);
		const id = item.id;
		const year = dateOf(item).slice(0, 4) || "Sin fecha";
		const score = item.vote_average ? item.vote_average.toFixed(1) : "-";

		return `
			<button class="card group overflow-hidden rounded-lg border border-zinc-900 bg-zinc-950 text-left text-zinc-100 transition duration-200 hover:-translate-y-1 hover:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-500" type="button" data-media-type="${mediaType}" data-id="${id}">
				${posterMarkup(item.poster_path, title)}
				<div class="space-y-2 p-3">
					<h3 class="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-white">${escapeHtml(title)}</h3>
					<div class="flex items-center justify-between gap-3 text-xs text-zinc-500">
						<span class="truncate">${typeOf(item)} · ${escapeHtml(year)}</span>
						<span class="font-semibold text-zinc-200">${score}</span>
					</div>
				</div>
			</button>
		`;
	}).join("");
}

async function loadTrending(mediaType = "all") {
	setLoading("Cargando tendencias...");
	resultsTitleElement.textContent = mediaType === "movie"
		? "Peliculas en tendencia"
		: mediaType === "tv"
			? "Series en tendencia"
			: "Tendencias de la semana";

	try {
		const data = await fetchJson(`/api/tmdb/trending?mediaType=${encodeURIComponent(mediaType)}`);
		renderResults(data.results || []);
	} catch (error) {
		setError(error.message);
	}
}

async function search() {
	const query = searchInput.value.trim();
	if (!query) {
		searchInput.focus();
		return;
	}

	setLoading("Buscando...");
	resultsTitleElement.textContent = `Resultados para "${query}"`;

	try {
		const params = new URLSearchParams({ type: searchType.value, query });
		const data = await fetchJson(`/api/tmdb/search?${params}`);
		renderResults(data.results || []);
	} catch (error) {
		setError(error.message);
	}
}

function detailTitle(data, mediaType) {
	return mediaType === "tv" ? data.name : data.title;
}

function renderDetails(data, mediaType) {
	const title = detailTitle(data, mediaType) || "Sin titulo";
	const date = mediaType === "tv" ? data.first_air_date : data.release_date;
	const year = date ? date.slice(0, 4) : "Sin fecha";
	const runtime = mediaType === "tv"
		? `${data.number_of_seasons || 0} temp.`
		: data.runtime
			? `${data.runtime} min`
			: "Duracion no disponible";
	const genres = (data.genres || []).map((genre) => `<span class="${chipClasses}">${escapeHtml(genre.name)}</span>`).join("");
	const cast = (data.credits?.cast || []).slice(0, 6).map((person) => escapeHtml(person.name)).join(", ");
	const overview = data.overview || "TMDB no tiene sinopsis en espanol para este titulo.";

	detailContent.innerHTML = `
		<article class="grid gap-6 px-5 pb-6 md:grid-cols-[240px_1fr] md:px-7">
			${posterMarkup(data.poster_path, title, detailPosterClasses)}
			<div class="min-w-0">
				<h3 class="mb-4 text-3xl font-semibold leading-none text-white md:text-5xl">${escapeHtml(title)}</h3>
				<div class="mb-4 flex flex-wrap gap-2">
					<span class="${chipClasses}">${typeOf({ media_type: mediaType })}</span>
					<span class="${chipClasses}">${escapeHtml(year)}</span>
					<span class="${chipClasses}">${escapeHtml(runtime)}</span>
					<span class="${chipClasses}">Nota ${data.vote_average ? data.vote_average.toFixed(1) : "-"}</span>
				</div>
				${genres ? `<div class="mb-5 flex flex-wrap gap-2">${genres}</div>` : ""}
				<p class="text-sm leading-7 text-zinc-300 md:text-base">${escapeHtml(overview)}</p>
				${cast ? `<p class="mt-5 text-sm leading-6 text-zinc-400"><strong class="font-semibold text-zinc-200">Reparto:</strong> ${cast}</p>` : ""}
			</div>
		</article>
	`;
}

async function openDetails(mediaType, id) {
	detailContent.innerHTML = `<p class="px-6 pb-6 text-sm text-zinc-500">Cargando detalle...</p>`;
	detailDialog.showModal();

	try {
		const data = await fetchJson(`/api/tmdb/${mediaType}/${id}`);
		renderDetails(data, mediaType);
	} catch (error) {
		detailContent.innerHTML = `<div class="mx-6 mb-6 ${errorClasses}">${escapeHtml(error.message)}</div>`;
	}
}

searchForm.addEventListener("submit", (event) => {
	event.preventDefault();
	search();
});

filterButtons.forEach((button) => {
	button.addEventListener("click", () => {
		setActiveFilter(button);
		loadTrending(button.dataset.mediaType);
	});
});

resultsElement.addEventListener("click", (event) => {
	const card = event.target.closest(".card");
	if (!card) {
		return;
	}
	openDetails(card.dataset.mediaType, card.dataset.id);
});

closeDialog.addEventListener("click", () => detailDialog.close());

setActiveFilter(document.querySelector(".filter-button.active"));
loadTrending();
