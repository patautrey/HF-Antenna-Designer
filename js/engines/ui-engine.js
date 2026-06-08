/* ============================================================
   HF Antenna Designer — UI Engine
   Light Theme • Engineering White‑Paper Style
   ============================================================ */

const UIEngine = {

    /* ------------------------------------------------------------
       1. CLEAR CONTAINER
       ------------------------------------------------------------ */
    clear(container) {
        container.innerHTML = "";
    },

    /* ------------------------------------------------------------
       2. CREATE SECTION PANEL
       ------------------------------------------------------------ */
    panel(title) {
        const div = document.createElement("div");
        div.className = "panel";

        const h = document.createElement("h2");
        h.textContent = title;

        div.appendChild(h);
        return div;
    },

    /* ------------------------------------------------------------
       3. CREATE INPUT FIELD
       ------------------------------------------------------------ */
    input(labelText, id, type = "number", value = "", step = "any") {
        const wrapper = document.createElement("div");

        const label = document.createElement("label");
        label.textContent = labelText;
        label.setAttribute("for", id);

        const input = document.createElement("input");
        input.id = id;
        input.type = type;
        input.value = value;
        input.step = step;

        wrapper.appendChild(label);
        wrapper.appendChild(input);

        return wrapper;
    },

    /* ------------------------------------------------------------
       4. CREATE SELECT DROPDOWN
       ------------------------------------------------------------ */
    select(labelText, id, options) {
        const wrapper = document.createElement("div");

        const label = document.createElement("label");
        label.textContent = labelText;
        label.setAttribute("for", id);

        const select = document.createElement("select");
        select.id = id;

        options.forEach(opt => {
            const o = document.createElement("option");
            o.value = opt.value;
            o.textContent = opt.label;
            select.appendChild(o);
        });

        wrapper.appendChild(label);
        wrapper.appendChild(select);

        return wrapper;
    },

    /* ------------------------------------------------------------
       5. CREATE BUTTON
       ------------------------------------------------------------ */
    button(text, id) {
        const btn = document.createElement("button");
        btn.id = id;
        btn.textContent = text;
        return btn;
    },

    /* ------------------------------------------------------------
       6. METRIC CARD (for Gain, TOA, SWR, etc.)
       ------------------------------------------------------------ */
    metricCard(title, value, unit = "") {
        const card = document.createElement("div");
        card.className = "panel";

        const h = document.createElement("h3");
        h.textContent = title;

        const p = document.createElement("p");
        p.style.fontSize = "1.4em";
        p.style.fontWeight = "600";
        p.style.marginTop = "10px";
        p.textContent = `${value} ${unit}`;

        card.appendChild(h);
        card.appendChild(p);

        return card;
    },

    /* ------------------------------------------------------------
       7. TABLE BUILDER (Geometry, Boom Layout, etc.)
       ------------------------------------------------------------ */
    table(headers, rows) {
        const table = document.createElement("table");

        const thead = document.createElement("thead");
        const trHead = document.createElement("tr");

        headers.forEach(h => {
            const th = document.createElement("th");
            th.textContent = h;
            trHead.appendChild(th);
        });

        thead.appendChild(trHead);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");

        rows.forEach(row => {
            const tr = document.createElement("tr");
            row.forEach(cell => {
                const td = document.createElement("td");
                td.textContent = cell;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        return table;
    },

    /* ------------------------------------------------------------
       8. CHART CONTAINER
       ------------------------------------------------------------ */
    chartContainer(id, title) {
        const panel = this.panel(title);

        const div = document.createElement("div");
        div.id = id;
        div.style.width = "100%";
        div.style.height = "400px";
        div.style.marginTop = "10px";

        panel.appendChild(div);
        return panel;
    },

    /* ------------------------------------------------------------
       9. TWO-COLUMN LAYOUT
       ------------------------------------------------------------ */
    twoColumn(leftContent, rightContent) {
        const wrapper = document.createElement("div");
        wrapper.style.display = "grid";
        wrapper.style.gridTemplateColumns = "1fr 1fr";
        wrapper.style.gap = "20px";
        wrapper.style.marginBottom = "20px";

        wrapper.appendChild(leftContent);
        wrapper.appendChild(rightContent);

        return wrapper;
    },

    /* ------------------------------------------------------------
       10. THREE-COLUMN LAYOUT
       ------------------------------------------------------------ */
    threeColumn(a, b, c) {
        const wrapper = document.createElement("div");
        wrapper.style.display = "grid";
        wrapper.style.gridTemplateColumns = "1fr 1fr 1fr";
        wrapper.style.gap = "20px";
        wrapper.style.marginBottom = "20px";

        wrapper.appendChild(a);
        wrapper.appendChild(b);
        wrapper.appendChild(c);

        return wrapper;
    },

    /* ------------------------------------------------------------
       11. SECTION TITLE
       ------------------------------------------------------------ */
    sectionTitle(text) {
        const h = document.createElement("h2");
        h.textContent = text;
        return h;
    },

    /* ------------------------------------------------------------
       12. RENDER FULL PAGE
       ------------------------------------------------------------ */
    render(container, sections) {
        this.clear(container);

        sections.forEach(sec => {
            container.appendChild(sec);
        });
    }
};

export default UIEngine;
