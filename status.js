/* ILDC Live Server Status
   Checks stats.json to determine if the convoy is active.
   If any player was seen in the last 10 minutes = "En Ruta"
*/

(async function checkServerStatus() {
  const ACTIVE_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

  try {
    // Fetch stats from GitHub (with cache-busting)
    const res = await fetch(
      'https://raw.githubusercontent.com/SamiGamin/ildc-website/master/stats.json?t=' + Date.now()
    );
    if (!res.ok) return setStatus('offline', 'Sin datos');
    const stats = await res.json();
    const players = stats.players || {};
    const now = Date.now();

    // Find active players (seen in last 10 min)
    const activePlayers = [];
    for (const [name, data] of Object.entries(players)) {
      if (data.lastSeen) {
        const lastSeen = new Date(data.lastSeen).getTime();
        if (now - lastSeen < ACTIVE_THRESHOLD_MS) {
          activePlayers.push(name);
        }
      }
    }

    if (activePlayers.length > 0) {
      const names = activePlayers.length <= 3
        ? activePlayers.join(', ')
        : activePlayers.slice(0, 2).join(', ') + ' +' + (activePlayers.length - 2);
      setStatus('online', 'En Ruta \uD83D\uDE9B \u2022 ' + activePlayers.length + ' online');
    } else {
      // Find when the last player was seen
      let lastActivity = 0;
      for (const data of Object.values(players)) {
        if (data.lastSeen) {
          const t = new Date(data.lastSeen).getTime();
          if (t > lastActivity) lastActivity = t;
        }
      }
      if (lastActivity > 0) {
        const ago = getTimeAgo(now - lastActivity);
        setStatus('offline', 'Offline \u2022 ' + ago);
      } else {
        setStatus('offline', 'Offline');
      }
    }
  } catch (e) {
    setStatus('offline', 'Sin conexion');
  }

  function setStatus(state, text) {
    // Hero status badge (index.html only)
    const liveStatus = document.getElementById('liveStatus');
    if (liveStatus) {
      liveStatus.className = 'live-status ' + state;
      liveStatus.querySelector('.status-text').textContent = text;
    }

    // Nav status indicator (all pages)
    const navStatus = document.getElementById('navStatus');
    if (navStatus) {
      navStatus.className = 'nav-status ' + state;
      navStatus.innerHTML = '<span class="status-dot-sm"></span>' +
        (state === 'online' ? 'En Ruta' : 'Offline');
    }
  }

  function getTimeAgo(ms) {
    const min = Math.floor(ms / 60000);
    if (min < 60) return 'hace ' + min + ' min';
    const hours = Math.floor(min / 60);
    if (hours < 24) return 'hace ' + hours + 'h';
    const days = Math.floor(hours / 24);
    return 'hace ' + days + 'd';
  }
})();
