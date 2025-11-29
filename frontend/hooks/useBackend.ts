const API_BASE =
  import.meta.env.VITE_CLIENT_TARGET ??
  (import.meta.env.DEV ? "http://localhost:4000" : "https://prod-cne-sh82.encr.app");

// Manual backend client with service namespaces
const backend = {
  announcements: {
    create: async (data: any) => {
      const response = await fetch(`${API_BASE}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    list: async (params: any) => {
      const response = await fetch(`${API_BASE}/announcements?limit=${params.limit}`);
      return response.json();
    },
    remove: async (params: any) => {
      const response = await fetch(`${API_BASE}/announcements/${params.id}?passcode=${params.passcode}`, {
        method: 'DELETE'
      });
      return response.json();
    }
  },
  events: {
    create: async (data: any) => {
      const response = await fetch(`${API_BASE}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    list: async (params: any) => {
      const response = await fetch(`${API_BASE}/events?upcoming=${params.upcoming}`);
      return response.json();
    },
    remove: async (params: any) => {
      const response = await fetch(`${API_BASE}/events/${params.id}?passcode=${params.passcode}`, {
        method: 'DELETE'
      });
      return response.json();
    },
    rsvp: async (params: any) => {
      const response = await fetch(`${API_BASE}/events/${params.eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendees: params.attendees })
      });
      return response.json();
    },
    cancelRsvp: async (params: any) => {
      const response = await fetch(`${API_BASE}/events/${params.eventId}/rsvp`, {
        method: 'DELETE'
      });
      return response.json();
    }
  },
  prayers: {
    create: async (data: any) => {
      const response = await fetch(`${API_BASE}/prayers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    list: async (params: any) => {
      const response = await fetch(`${API_BASE}/prayers?limit=${params.limit}`);
      return response.json();
    },
    pray: async (params: any) => {
      const response = await fetch(`${API_BASE}/prayers/${params.prayerId}/pray`, {
        method: 'POST'
      });
      return response.json();
    }
  },
  church: {
    info: async () => {
      const response = await fetch(`${API_BASE}/church/info`);
      return response.json();
    }
  },
  donations: {
    create: async (data: any) => {
      const response = await fetch(`${API_BASE}/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    list: async (params: any) => {
      const response = await fetch(`${API_BASE}/donations?limit=${params.limit}`);
      return response.json();
    }
  },
  media: {
    list: async () => {
      const response = await fetch(`${API_BASE}/media`);
      return response.json();
    },
    uploadUrl: async (params: any) => {
      const response = await fetch(`${API_BASE}/media/upload-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      return response.json();
    }
  }
};

export function useBackend() {
  return backend;
}
