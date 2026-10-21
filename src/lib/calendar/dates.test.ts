import { describe, expect, it } from "vitest";
import { addMonths, daysInMonth, monthGrid, toLocalDateKey } from "./dates";

describe("toLocalDateKey", () => {
  it("usa la zona horaria indicada, no la del ordenador", () => {
    expect(toLocalDateKey(new Date("2026-03-01T23:30:00Z"), "Europe/Madrid")).toBe("2026-03-02");
    expect(toLocalDateKey(new Date("2026-03-02T03:00:00Z"), "America/New_York")).toBe("2026-03-01");
    expect(toLocalDateKey(new Date("2026-03-01T23:30:00Z"), "UTC")).toBe("2026-03-01");
  });

  it("respeta el cambio de hora de verano e invierno de Madrid", () => {
    // 29/03/2026: sale el horario de verano (UTC+2)
    expect(toLocalDateKey(new Date("2026-03-28T22:30:00Z"), "Europe/Madrid")).toBe("2026-03-28");
    expect(toLocalDateKey(new Date("2026-03-29T22:30:00Z"), "Europe/Madrid")).toBe("2026-03-30");
    // 25/10/2026: vuelve el horario de invierno (UTC+1)
    expect(toLocalDateKey(new Date("2026-10-25T22:30:00Z"), "Europe/Madrid")).toBe("2026-10-25");
    expect(toLocalDateKey(new Date("2026-10-25T23:30:00Z"), "Europe/Madrid")).toBe("2026-10-26");
  });

  it("siempre devuelve el formato AAAA-MM-DD con ceros", () => {
    expect(toLocalDateKey(new Date("2026-01-05T12:00:00Z"), "Europe/Madrid")).toBe("2026-01-05");
  });
});

describe("daysInMonth", () => {
  it("febrero de 2028 (bisiesto) tiene 29 días y el de 2026 tiene 28", () => {
    expect(daysInMonth(2028, 2)).toBe(29);
    expect(daysInMonth(2026, 2)).toBe(28);
  });

  it("los años de siglo solo son bisiestos si se dividen entre 400", () => {
    expect(daysInMonth(2000, 2)).toBe(29);
    expect(daysInMonth(2100, 2)).toBe(28);
  });

  it("devuelve los días del resto de meses", () => {
    expect(daysInMonth(2026, 1)).toBe(31);
    expect(daysInMonth(2026, 4)).toBe(30);
    expect(daysInMonth(2026, 12)).toBe(31);
  });
});

describe("monthGrid", () => {
  it("cada fila tiene 7 elementos, en cualquier mes de varios años", () => {
    for (let y = 2026; y <= 2028; y++) {
      for (let m = 1; m <= 12; m++) {
        const g = monthGrid(y, m);
        expect(g.length).toBeGreaterThanOrEqual(4);
        expect(g.length).toBeLessThanOrEqual(6);
        for (const fila of g) expect(fila).toHaveLength(7);
      }
    }
  });

  it("las semanas empiezan en lunes y se rellena con días del mes anterior y siguiente", () => {
    // Octubre de 2026 empieza en jueves.
    const g = monthGrid(2026, 10);
    expect(g[0][0]).toBe("2026-09-28");
    expect(g[0][3]).toBe("2026-10-01");
    expect(g.at(-1)!.at(-1)).toBe("2026-11-01");
    expect(g).toHaveLength(5);
  });

  it("un mes que empieza en domingo lleva seis días de relleno delante", () => {
    // Noviembre de 2026 empieza en domingo.
    const g = monthGrid(2026, 11);
    expect(g[0][0]).toBe("2026-10-26");
    expect(g[0][6]).toBe("2026-11-01");
  });

  it("febrero de 2027 empieza en lunes y cabe exactamente en 4 semanas", () => {
    const g = monthGrid(2027, 2);
    expect(g).toHaveLength(4);
    expect(g[0][0]).toBe("2027-02-01");
    expect(g[3][6]).toBe("2027-02-28");
  });

  it("febrero de 2028 incluye el día 29", () => {
    expect(monthGrid(2028, 2).flat()).toContain("2028-02-29");
  });

  it("cruza bien el cambio de año", () => {
    const g = monthGrid(2026, 12);
    expect(g.flat()).toContain("2026-12-31");
    expect(g.at(-1)!.at(-1)).toBe("2027-01-03");
  });

  it("rechaza un mes que no existe", () => {
    expect(() => monthGrid(2026, 0)).toThrow(RangeError);
    expect(() => monthGrid(2026, 13)).toThrow(RangeError);
    expect(() => monthGrid(2026, 1.5)).toThrow(RangeError);
  });
});

describe("addMonths", () => {
  it("avanza y retrocede cruzando el año", () => {
    expect(addMonths(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
    expect(addMonths(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
    expect(addMonths(2026, 5, 0)).toEqual({ year: 2026, month: 5 });
    expect(addMonths(2026, 3, 14)).toEqual({ year: 2027, month: 5 });
  });
});
