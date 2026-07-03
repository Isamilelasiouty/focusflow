import { initAuthListener, currentUser, login, signup, logout } from "./core/auth.js";
import { bus } from "./core/event-bus.js";
import { registerRoute, initRouter, navigate } from "./core/router.js";
import { showToast } from "./shared/components/toast.js";
import { startTasksSubscription, allTasks } from "./modules/tasks/task-service.js";
import { renderDashboardView } from "./modules/dashboard/dashboard.js";
import { renderTasksView } from "./modules/tasks/task-list.js";
import { openQuickAddTask } from "./modules/tasks/task-form.js";
import { getElapsedSeconds, restoreTimerFromStorage, stopTimer } from "./modules/timetracker/timer-service.js";
import { isOverdue } from "./shared/utils/date-utils.js";

const NAV_ITEMS = [
  { route: "dashboard", label: "لوحة التحكم", icon: "layout-dashboard" },
  { route: "tasks", label: "المهام", icon: "checklist" },
  { route: "projects", label: "المشاريع", icon: "briefcase" },
  { route: "seo", label: "SEO Hub", icon: "search" },
  { route: "study", label: "الدراسة", icon: "book" },
  { route: "goals", label: "الأهداف", icon: "target-arrow" },
  { route: "notes", label: "الملاحظات", icon: "notes" },
  { route: "references", label: "المراجع", icon: "link" },
  { route: "timetracker", label: "متابعة الوقت", icon: "clock" },
  { route: "reports", label: "التقارير", icon: "chart-bar" },
  { route: "settings", label: "الإعدادات", icon: "settings" }
];

function renderAuthScreen() {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg-page)">
      <div class="card" style="width:360px">
        <h2 style="margin-bottom:4px">مرحبًا بعودتك</h2>
        <p style="font-size:12px;color:var(--text-secondary);margin-bottom:18px">سجّل الدخول لمتابعة نظامك الشخصي</p>
        <div class="form-group">
          <label>البريد الإلكتروني</label>
          <input type="email" id="auth-email" placeholder="name@example.com">
        </div>
        <div class="form-group">
          <label>كلمة المرور</label>
          <input type="password" id="auth-password" placeholder="••••••••">
        </div>
        <button class="primary" id="login-btn" style="width:100%;margin-bottom:8px">تسجيل الدخول</button>
        <button class="ghost" id="signup-btn" style="width:100%">إنشاء حساب جديد</button>
      </div>
    </div>
  `;

  root.querySelector("#login-btn").onclick = async () => {
    const email = root.querySelector("#auth-email").value.trim();
    const password = root.querySelector("#auth-password").value;
    try {
      await login(email, password);
    } catch (err) {
      showToast("تعذر تسجيل الدخول: تحقق من البيانات", "error");
    }
  };

  root.querySelector("#signup-btn").onclick = async () => {
    const email = root.querySelector("#auth-email").value.trim();
    const password = root.querySelector("#auth-password").value;
    if (password.length < 6) {
      showToast("كلمة المرور يجب أن تكون 6 أحرف على الأقل", "error");
      return;
    }
    try {
      await signup("", email, password);
      showToast("تم إنشاء الحساب بنجاح");
    } catch (err) {
      showToast("تعذر إنشاء الحساب", "error");
    }
  };
}

function renderAppShell(user) {
  const root = document.getElementById("root");
  root.innerHTML = `
    <div id="app-shell">
      <aside id="sidebar">
        <div class="brand"><i class="ti ti-bolt"></i> Focusflow</div>
        ${NAV_ITEMS.map((item) => `
          <div class="nav-item" data-route="${item.route}" onclick="location.hash='${item.route}'">
            <i class="ti ti-${item.icon}"></i>
            <span>${item.label}</span>
            ${item.route === "tasks" ? `<span class="badge hidden" id="overdue-badge"></span>` : ""}
          </div>
        `).join("")}
        <div style="flex:1"></div>
        <div class="nav-item" id="logout-btn">
          <i class="ti ti-logout"></i><span>تسجيل الخروج</span>
        </div>
      </aside>
      <main id="main-area">
        <header id="topbar">
          <div id="global-search"><i class="ti ti-search"></i> بحث عام (Ctrl+K)</div>
          <div class="top-spacer"></div>
          <div id="timer-widget"><i class="ti ti-player-play"></i><span id="timer-label">لا يوجد تتبع نشط</span></div>
          <button class="primary" id="quick-add-btn"><i class="ti ti-plus"></i> إضافة سريعة</button>
        </header>
        <section id="view-container"></section>
      </main>
    </div>
  `;

  root.querySelector("#logout-btn").onclick = () => logout();
  root.querySelector("#quick-add-btn").onclick = openQuickAddTask;

  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "n" && !isTyping(e)) openQuickAddTask();
  });

  setupTimerWidget();

  registerRoute("dashboard", renderDashboardView);
  registerRoute("tasks", renderTasksView);

  initRouter("view-container", "dashboard");
  startTasksSubscription(user.uid);
  restoreTimerFromStorage();

  bus.on("tasks:updated", updateOverdueBadge);
}

function isTyping(e) {
  const tag = e.target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function updateOverdueBadge() {
  const badge = document.getElementById("overdue-badge");
  if (!badge) return;
  const count = allTasks.filter((t) => isOverdue(t.dueDate, t.status)).length;
  if (count > 0) {
    badge.textContent = count;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

function setupTimerWidget() {
  const widget = document.getElementById("timer-widget");
  const label = document.getElementById("timer-label");

  widget.onclick = () => {
    if (widget.classList.contains("running")) {
      stopTimer();
      showToast("تم إيقاف تتبع الوقت وحفظه");
    }
  };

  bus.on("timer:started", () => {
    widget.classList.add("running");
  });
  bus.on("timer:tick", (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    label.textContent = `${h}:${m}:${s}`;
  });
  bus.on("timer:stopped", () => {
    widget.classList.remove("running");
    label.textContent = "لا يوجد تتبع نشط";
  });
}

function bootstrap() {
  initAuthListener();
  bus.on("auth:changed", (user) => {
    if (user) {
      renderAppShell(user);
    } else {
      renderAuthScreen();
    }
  });
}

bootstrap();
