import { formatCurrency, formatDate } from "./state.js";

export function renderTransactionsTable(transactions, options = {}) {
  const { highlightRe = null, onEdit = null, onDelete = null } = options;

  const tbody = document.getElementById("transactions-tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!transactions || transactions.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-state">
          No transactions found.
          <a href="add.html">Add your first transaction</a>
        </td>
      </tr>
    `;
    return;
  }

  transactions.forEach((t) => {
    const formattedAmount = formatCurrency(t.amount);
    const formattedDate = formatDate(t.date);

    let descriptionHTML = t.description;
    if (highlightRe) {
      try {
        descriptionHTML = t.description.replace(
          highlightRe,
          (match) => `<mark>${match}</mark>`
        );
      } catch (err) {
        descriptionHTML = t.description;
      }
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${formattedDate}</td>
      <td>${descriptionHTML}</td>
      <td>${t.category}</td>
      <td>${formattedAmount}</td>
      <td class="actions">
        <button class="btn btn-small btn-edit" data-id="${t.id}">Edit</button>
        <button class="btn btn-small btn-danger btn-delete" data-id="${t.id}">Delete</button>
      </td>
    `;

    const editBtn = tr.querySelector(".btn-edit");
    if (editBtn && typeof onEdit === "function") {
      editBtn.addEventListener("click", () => onEdit(t.id));
    } else if (editBtn) {
      editBtn.addEventListener("click", () => {
        window.location.href = `add.html?id=${t.id}`;
      });
    }

    const deleteBtn = tr.querySelector(".btn-delete");
    if (deleteBtn && typeof onDelete === "function") {
      deleteBtn.addEventListener("click", () => onDelete(t.id));
    } else if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        const confirmed = confirm("Delete this transaction?");
        if (confirmed) {
        }
      });
    }

    tbody.appendChild(tr);
  });
}

export function showModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.hidden = false;
}

export function hideModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.hidden = true;
}

export function showFormStatus(message, type = "success") {
  const existing = document.getElementById("form-status");
  if (existing) {
    existing.textContent = message;
    existing.className = `form-status ${type}`;
    return;
  }

  const statusEl = document.createElement("div");
  statusEl.id = "form-status";
  statusEl.className = `form-status ${type}`;
  statusEl.textContent = message;
  statusEl.style.position = "fixed";
  statusEl.style.top = "20px";
  statusEl.style.right = "20px";
  statusEl.style.zIndex = "1000";
  statusEl.style.padding = "12px 20px";
  statusEl.style.borderRadius = "4px";
  statusEl.style.fontWeight = "500";

  if (type === "success") {
    statusEl.style.backgroundColor = "#4CAF50";
    statusEl.style.color = "white";
  } else if (type === "error") {
    statusEl.style.backgroundColor = "#f44336";
    statusEl.style.color = "white";
  } else {
    statusEl.style.backgroundColor = "#2196F3";
    statusEl.style.color = "white";
  }

  document.body.appendChild(statusEl);
  setTimeout(() => statusEl.remove(), 3000);
}

export function showDataStatus(message, type = "success") {
  const existing = document.getElementById("data-status");
  if (existing) {
    existing.textContent = message;
    existing.className = `data-status ${type}`;
    existing.style.display = "block";
    return;
  }

  const statusEl = document.createElement("div");
  statusEl.id = "data-status";
  statusEl.className = `data-status ${type}`;
  statusEl.textContent = message;
  statusEl.style.position = "fixed";
  statusEl.style.top = "20px";
  statusEl.style.right = "20px";
  statusEl.style.zIndex = "1000";
  statusEl.style.padding = "12px 20px";
  statusEl.style.borderRadius = "4px";
  statusEl.style.fontWeight = "500";
  statusEl.style.display = "block";

  if (type === "success") {
    statusEl.style.backgroundColor = "#4CAF50";
    statusEl.style.color = "white";
  } else if (type === "error") {
    statusEl.style.backgroundColor = "#f44336";
    statusEl.style.color = "white";
  } else {
    statusEl.style.backgroundColor = "#2196F3";
    statusEl.style.color = "white";
  }

  document.body.appendChild(statusEl);
  setTimeout(() => statusEl.remove(), 3000);
}
