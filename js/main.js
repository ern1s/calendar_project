document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");
  const token = localStorage.getItem("token");

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    events: {
      url: "http://localhost:8000/api/events/",
      method: "GET",
      extraParams: {},
      failure: () => {
        alert("Ошибка загрузки событий");
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },

    // ✅ ОБРАБОТЧИК КЛИКА ПО СОБЫТИЮ
    eventClick: function (info) {
      const event = info.event;

      const action = prompt("Введите 'edit' для редактирования или 'delete' для удаления:");

      if (action === "edit") {
        const newTitle = prompt("Новое название события:", event.title);
        if (newTitle === null) return;

        fetch(`http://localhost:8000/api/events/${event.id}/`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: newTitle,
            start_time: event.start.toISOString(),
            end_time: event.end?.toISOString() || event.start.toISOString(),
          }),
        }).then((res) => {
          if (res.ok) {
            alert("Событие обновлено");
            event.setProp("title", newTitle);
          } else {
            alert("Ошибка при обновлении");
          }
        });
      } else if (action === "delete") {
        const confirmDelete = confirm("Удалить это событие?");
        if (!confirmDelete) return;

        fetch(`http://localhost:8000/api/events/${event.id}/`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then((res) => {
          if (res.ok) {
            alert("Событие удалено");
            event.remove();
          } else {
            alert("Ошибка при удалении");
          }
        });
      }
    },
  });

  calendar.render();

  // ✅ ОБРАБОТКА ФОРМЫ ЛОГИНА
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      const res = await fetch("http://localhost:8000/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.access);
        window.location.href = "index.html";
      } else {
        alert("Неверные данные");
      }
    });
  }

  // ✅ ОБРАБОТКА ФОРМЫ СОБЫТИЙ
  const eventForm = document.getElementById("event-form");
  if (eventForm) {
    eventForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = document.getElementById("event-title").value;
      const start = document.getElementById("event-start").value;
      const end = document.getElementById("event-end").value;

      const res = await fetch("http://localhost:8000/api/events/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title,
          start_time: start,
          end_time: end,
        }),
      });

      if (res.ok) {
        alert("Событие добавлено");
        eventForm.reset();
        calendar.refetchEvents();
      } else {
        alert("Ошибка при добавлении события");
      }
    });
  }
});
