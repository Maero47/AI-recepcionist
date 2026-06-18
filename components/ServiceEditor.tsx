"use client";

import { useState } from "react";
import type { Service } from "@/lib/types";

const emptyService = (businessId: string): Omit<Service, "id"> => ({
  businessId,
  name: "",
  description: "",
  startingPrice: "",
  priceNote: "",
  durationMinutes: 0,
  active: true
});

export function ServiceEditor({ businessId, initialServices }: { businessId: string; initialServices: Service[] }) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [newService, setNewService] = useState<Omit<Service, "id">>(emptyService(businessId));
  const [status, setStatus] = useState("");

  function updateLocal(id: string, patch: Partial<Service>) {
    setServices((current) => current.map((service) => (service.id === id ? { ...service, ...patch } : service)));
  }

  async function addService() {
    const response = await fetch("/api/services", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newService)
    });

    if (!response.ok) {
      setStatus("Could not add service.");
      return;
    }

    const data = (await response.json()) as { service: Service };
    setServices((current) => [data.service, ...current]);
    setNewService(emptyService(businessId));
    setStatus("Service added.");
  }

  async function saveService(service: Service) {
    const response = await fetch(`/api/services/${service.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: service.name,
        description: service.description,
        startingPrice: service.startingPrice,
        priceNote: service.priceNote,
        durationMinutes: service.durationMinutes,
        active: service.active
      })
    });

    setStatus(response.ok ? "Service saved." : "Could not save service.");
  }

  async function removeService(id: string) {
    const response = await fetch(`/api/services/${id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      setServices((current) => current.filter((service) => service.id !== id));
      setStatus("Service removed.");
    } else {
      setStatus("Could not remove service.");
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Services</h2>
          <p className="muted">Only these services and prices are safe for the assistant to mention.</p>
        </div>
      </div>

      <div className="editor-list">
        <div className="editor-row two">
          <label className="field">
            <span>Service name</span>
            <input
              className="input"
              value={newService.name}
              onChange={(event) => setNewService((current) => ({ ...current, name: event.target.value }))}
            />
          </label>
          <label className="field">
            <span>Starting price</span>
            <input
              className="input"
              value={newService.startingPrice}
              onChange={(event) => setNewService((current) => ({ ...current, startingPrice: event.target.value }))}
            />
          </label>
          <label className="field full">
            <span>Description</span>
            <textarea
              className="textarea"
              value={newService.description}
              onChange={(event) => setNewService((current) => ({ ...current, description: event.target.value }))}
            />
          </label>
          <label className="field">
            <span>Price note</span>
            <input
              className="input"
              value={newService.priceNote}
              onChange={(event) => setNewService((current) => ({ ...current, priceNote: event.target.value }))}
            />
          </label>
          <label className="field">
            <span>Duration minutes</span>
            <input
              className="input"
              type="number"
              min="0"
              value={newService.durationMinutes}
              onChange={(event) =>
                setNewService((current) => ({ ...current, durationMinutes: Number(event.target.value) }))
              }
            />
          </label>
          <div className="inline-actions field full">
            <button className="button" type="button" onClick={addService}>
              Add service
            </button>
          </div>
        </div>

        {services.map((service) => (
          <div className="editor-row two" key={service.id}>
            <label className="field">
              <span>Name</span>
              <input
                className="input"
                value={service.name}
                onChange={(event) => updateLocal(service.id, { name: event.target.value })}
              />
            </label>
            <label className="field">
              <span>Starting price</span>
              <input
                className="input"
                value={service.startingPrice}
                onChange={(event) => updateLocal(service.id, { startingPrice: event.target.value })}
              />
            </label>
            <label className="field full">
              <span>Description</span>
              <textarea
                className="textarea"
                value={service.description}
                onChange={(event) => updateLocal(service.id, { description: event.target.value })}
              />
            </label>
            <label className="field">
              <span>Price note</span>
              <input
                className="input"
                value={service.priceNote}
                onChange={(event) => updateLocal(service.id, { priceNote: event.target.value })}
              />
            </label>
            <label className="field">
              <span>Duration minutes</span>
              <input
                className="input"
                type="number"
                min="0"
                value={service.durationMinutes}
                onChange={(event) => updateLocal(service.id, { durationMinutes: Number(event.target.value) })}
              />
            </label>
            <label className="checkline">
              <input
                type="checkbox"
                checked={service.active}
                onChange={(event) => updateLocal(service.id, { active: event.target.checked })}
              />
              Active
            </label>
            <div className="inline-actions">
              <button className="button secondary" type="button" onClick={() => saveService(service)}>
                Save
              </button>
              <button className="button danger" type="button" onClick={() => removeService(service.id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      {status ? <p className="muted">{status}</p> : null}
    </section>
  );
}
