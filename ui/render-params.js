export function renderParamsForm(container, schema, values, onChange) {
  container.innerHTML = `<h3>Antenna Parameters</h3>`;

  for (const key in schema) {
    const field = schema[key];
    const value = values[key] ?? field.default;

    container.innerHTML += `
      <label>
        ${field.label}<br>
        <input type="${field.type}" id="param_${key}" value="${value}">
      </label><br><br>
    `;
  }

  // Attach listeners
  for (const key in schema) {
    document.getElementById(`param_${key}`).oninput = () => {
      const newValues = {};
      for (const k in schema) {
        newValues[k] = parseFloat(document.getElementById(`param_${k}`).value);
      }
      onChange(newValues);
    };
  }
}
