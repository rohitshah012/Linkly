document.addEventListener("DOMContentLoaded", () => {
    const menuButton = document.querySelector(".menu-button");
    const navigationLinks = document.getElementById("navLinks");

    menuButton?.addEventListener("click", () => {
        const isOpen = navigationLinks?.classList.toggle("open") ?? false;
        menuButton.setAttribute("aria-expanded", String(isOpen));
    });

    document.querySelector(".mobile-menu")?.addEventListener("click", () => {
        document.getElementById("sidebar")?.classList.toggle("open");
    });

    document.querySelectorAll(".user-summary").forEach((summary) => {
        summary.addEventListener("click", () => {
            summary.closest(".user-card")?.classList.toggle("open");
        });
    });

    document.getElementById("userSearch")?.addEventListener("input", (event) => {
        const query = event.target.value.trim().toLowerCase();
        const cards = document.querySelectorAll(".user-card");
        let visible = 0;

        cards.forEach((card) => {
            const matches = (card.dataset.search || "").includes(query);
            card.classList.toggle("hidden", !matches);
            if (matches) visible += 1;
        });

        const resultCount = document.getElementById("resultCount");
        if (resultCount) {
            resultCount.textContent = `${visible} ${visible === 1 ? "user" : "users"}`;
        }
    });

    document.querySelectorAll(".password-toggle").forEach((button) => {
        button.addEventListener("click", () => {
            const input = button.closest(".input-wrap")?.querySelector('input[type="password"], input[type="text"]');
            if (!input) return;

            const showing = input.type === "text";
            input.type = showing ? "password" : "text";
            button.textContent = showing ? "Show" : "Hide";
        });
    });

    document.querySelectorAll(".copy-button").forEach((button) => {
        button.addEventListener("click", async () => {
            const link = button.dataset.copy;

            try {
                await navigator.clipboard.writeText(link);
                button.textContent = "Copied!";
                window.setTimeout(() => {
                    button.textContent = "Copy";
                }, 1800);
            } catch (error) {
                window.prompt("Copy this link:", link);
            }
        });
    });

    document.querySelectorAll(".delete-button[data-short-id]").forEach((button) => {
        button.addEventListener("click", async () => {
            if (!window.confirm("Delete this short link? This cannot be undone.")) return;

            button.disabled = true;
            button.textContent = "Deleting...";

            try {
                const response = await fetch(`/url/${encodeURIComponent(button.dataset.shortId)}`, {
                    method: "DELETE",
                });

                if (!response.ok) throw new Error("Delete request failed");
                window.location.reload();
            } catch (error) {
                button.disabled = false;
                button.textContent = "Delete";
                window.alert("We could not delete this link. Please try again.");
            }
        });
    });
});
