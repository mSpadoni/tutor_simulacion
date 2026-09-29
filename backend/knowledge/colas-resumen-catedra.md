# Clases de la cátedra: sistemas de colas (2C 2026)

> tipo: modelo

Fuente: clases "Clase EaE" y "Clase N Colas" de la cátedra (Ing. Milin – Ing. Mammana, 2C 2026), más el resumen "Ejercicios Colas (NS)". Es material oficial: los diagramas se pasaron a pasos.
Nomenclatura de las clases: SPS = sumatoria de permanencia en el sistema (método "nuevo"), HV = high value, ITO/STO = inicio/sumatoria de tiempo ocioso, CLL = cantidad de llegadas.

## Colas — clases oficiales

### Primer caso: 1 puesto con su cola, cómo se arma el análisis previo

Enunciado de la clase: sistema con un puesto de atención y su cola. Se conoce el intervalo entre arribos (IA, f.d.p.) y el tiempo de atención (TA, f.d.p., conocido recién cuando el cliente empieza a ser atendido). Se pide PPS y PTO. Restricciones: sistema cautivo (no hay arrepentimiento) y un solo servidor.

- **Datos:** IA, TA
- **Control:** ---
- **Resultado:** PPS (promedio de permanencia en el sistema), PTO (porcentaje de tiempo ocioso del puesto)
- **Estado:** NS (cantidad de clientes en el sistema)

Cómo se completa la T.E.I. (razonamiento de la clase):
1. LLEGADA: generando IA puedo decir la hora exacta de la próxima llegada (ej. T = 10:00, IA = 12' → TPLL = 10:12). Por eso LLEGADA genera LLEGADA como E.F.NO C., y TPLL entra en la T.E.F.
2. SALIDA desde la LLEGADA: si soy la única persona en el sistema (NS = 1) sé cuándo voy a salir, porque soy el siguiente en ser atendido: TPS = T + TA. Si no soy el único, tengo que esperar. Por eso LLEGADA genera SALIDA como E.F.C. con condición NS = 1.
3. SALIDA desde la SALIDA: al producirse una salida se desocupa el servidor y el siguiente accede a él, así que puedo determinar el TPS; pero no si no queda nadie en la cola. Por eso SALIDA no tiene E.F.NO C. (---) y genera SALIDA como E.F.C. con condición NS > 0.

| Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|
| LLEGADA | LLEGADA | SALIDA | NS = 1 |
| SALIDA | --- | SALIDA | NS > 0 |

T.E.F. = TPLL, TPS

El diagrama completo de este caso está en la sección 5 de la base de conocimiento.

### N puestos con N colas (cada puesto tiene su fila)

El cliente va a la fila con menos personas.

- **Datos:** IA, TA
- **Control:** N (cantidad de puestos)
- **Resultado:** PPS, PTO(i) (porcentaje de tiempo ocioso de cada puesto)
- **Estado:** NS(i) (cantidad de clientes en cada cola)

| Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|
| LLEGADA | LLEGADA | SALIDA(i) | NS(i) = 1 |
| SALIDA(i) | --- | SALIDA(i) | NS(i) > 0 |

T.E.F. = TPLL, TPS(i)

Diagrama de flujo (clase N colas):
1. **C.I.**: `SPS = CLL = T = TPLL = 0`; para i = 1..N: `TPS(i) = HV`, `ITO(i) = STO(i) = NS(i) = 0`.
2. **MENOR TPS(i)**: buscar la salida más próxima y de qué puesto es (rutina: `MEN = HV`; para j = 1..N, si `TPS(j) < MEN` → `i = j`, `MEN = TPS(j)`; se usa j para no pisar i). ¿TPLL ≤ TPS(i)?
   - SI → **LLEGADA**: `SPS = SPS + (TPLL − T) · Σ NS(i)` (se recorren todas las colas); `T = TPLL`; generar IA; `TPLL = T + IA`; **MENOR NS(i)** (el cliente va a la fila con menos gente; misma rutina que MENOR TPS pero con NS); `NS(i) = NS(i) + 1`; `CLL = CLL + 1`; ¿NS(i) = 1? SI → generar TA; `TPS(i) = T + TA`; `STO(i) = STO(i) + [T − ITO(i)]`.
   - NO → **SALIDA(i)**: `SPS = SPS + [TPS(i) − T] · Σ NS(j)` (j recorre todas las colas, porque i es el puesto que sale); `T = TPS(i)`; `NS(i) = NS(i) − 1`; ¿NS(i) > 0? SI → generar TA; `TPS(i) = T + TA`. NO → `ITO(i) = T`; `TPS(i) = HV`.
3. ¿T ≤ TF? SI → volver a 2.
4. NO → **vaciamiento**: se recorre el vector NS (i = 1..N); si algún `NS(i) ≠ 0` → `TPLL = HV` y volver a 2.
5. Sistema vacío → `PPS = SPS / CLL`; CALC PRINT PTO: para i = 1..N, `PTO(i) = [STO(i) · 100] / T`; imprimir N: PPS, PTO(i).

Con dos puestos: `SPS = SPS + (TPLL − T) · (NS1 + NS2)` en la llegada y `SPS = SPS + (TPS1 − T) · (NS1 + NS2)` en la salida 1 (igual en la salida 2). Si se piden por separado: `SPS1 = SPS1 + (Tpróximo − T) · NS1` y `SPS2 = SPS2 + (Tpróximo − T) · NS2` en cada evento.

### N puestos con 1 sola cola (cola única)

- **Datos:** IA, TA
- **Control:** N (cantidad de puestos)
- **Resultado:** PPS, PTO(i)
- **Estado:** NS (cantidad de clientes en el sistema)

Por qué esas condiciones (ejemplo de la clase con N = 3):
- E.F.C. de LLEGADA: mientras la cantidad de clientes no supere la cantidad de puestos, el que llega entra directo a un puesto y puedo calcular su salida: **NS ≤ N**. Con NS = 4 todos los puestos están ocupados y ya no puedo saber a qué hora sale.
- E.F.C. de SALIDA(i): al desocuparse el puesto, el primero que espera accede a él y puedo calcular la próxima salida, mientras haya gente esperando: **NS ≥ N** (NS ya descontado). Si no, ese puesto queda libre: `TPS(i) = HV`.

| Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|
| LLEGADA | LLEGADA | SALIDA(i) | NS ≤ N |
| SALIDA(i) | --- | SALIDA(i) | NS ≥ N |

T.E.F. = TPLL, TPS(i)

Diagrama de flujo (clase N colas):
1. **C.I.**: `SPS = CLL = T = TPLL = NS = 0`; para i = 1..N: `TPS(i) = HV`, `ITO(i) = STO(i) = 0`.
2. MENOR TPS(i). ¿TPLL ≤ TPS(i)?
   - SI → **LLEGADA**: `SPS = SPS + (TPLL − T) · NS`; `T = TPLL`; generar IA; `TPLL = T + IA`; `NS = NS + 1`; `CLL = CLL + 1`; ¿NS ≤ N? SI → **HV EN TPS(i)** (buscar un puesto libre: un puesto está libre cuando su TPS(i) = HV; se recorre i desde 1 hasta encontrarlo); generar TA; `TPS(i) = T + TA`; `STO(i) = STO(i) + [T − ITO(i)]`.
   - NO → **SALIDA(i)**: `SPS = SPS + [TPS(i) − T] · NS`; `T = TPS(i)`; `NS = NS − 1`; ¿NS ≥ N? SI → generar TA; `TPS(i) = T + TA`. NO → `ITO(i) = T`; `TPS(i) = HV`.
3. ¿T ≤ TF? SI → volver a 2.
4. NO → **vaciamiento** (hay una sola cola): ¿NS = 0? NO → `TPLL = HV` y volver a 2.
5. `PPS = SPS / CLL`; CALC PRINT PTO; imprimir N: PPS, PTO(i).

### Colas con prioridades (2 colas, 2 puestos, la cola 1 con prioridad)

Ejemplo de la clase (es el ejercicio 5 de la guía oficial): NS1 tiene prioridad sobre NS2 (es "VIP"). El puesto 1 atiende solamente a las personas de su fila (NS1). El puesto 2 atiende a las personas de su fila (NS2) siempre y cuando no haya personas en la otra fila (NS1).

- **Datos:** IA, TA1 (tiempo de atención del puesto 1), TA2 (tiempo de atención del puesto 2)
- **Control:** ---
- **Resultado:** PEC (promedio de espera en cola), PPS, PTO(i)
- **Estado:** NS1, NS2 (clientes en cada cola)
- **Eventos:** LLEGADA (E.F.NO C.: LLEGADA; E.F.C.: SALIDA1 y SALIDA2), SALIDA1 (E.F.C.: SALIDA1), SALIDA2 (E.F.C.: SALIDA2).

T.E.F. = TPLL, TPS1, TPS2

En la clase, las condiciones de la T.E.I. se dejan para que las piense el alumno: guialo con preguntas (¿cuándo puede empezar a atenderse alguien en cada puesto?) en lugar de darlas resueltas.

### Arrepentimiento con varios tramos (un único R)

Otro ejemplo de la clase: según la cantidad de personas en la cola, se arrepiente un porcentaje distinto en cada tramo (ej. 90%, 60% o 20% según el tramo). Se genera **un único R** al principio de la rutina y se compara con el porcentaje del tramo que corresponde. Como siempre, si se arrepiente se cuenta en CARR y **no se actualiza NS**.

### Tiempo comprometido: 1, 2 y N puestos (clase "Remisería")

Fuente: clase "Tiempo Comprometido 1 - 2 - N puestos" de la cátedra (Ing. Quiroga – Ing. Flecha – Ing. Alfiero). Se usa cuando **el tiempo de atención se conoce desde la llegada del cliente al sistema** (en una remisería, al recibir la llamada ya se sabe cuánto dura el viaje): al llegar ya se sabe hasta cuándo queda ocupado el puesto, así que no hace falta un evento de salida.

Enunciado de la clase: los clientes llegan con una f.d.p. equiprobable entre 5 y 20 minutos; el tiempo de atención se conoce desde la llegada y responde a una normal entre 10 y 20 minutos. Se desea el promedio de espera en cola y el porcentaje de tiempo ocioso (con 2 y N puestos, el cliente va al puesto donde espera menos y se pide el ocio de cada puesto).

- **Datos:** IA, TA
- **Control:** --- (implícita); con N puestos, N (cantidad de puestos)
- **Resultado:** PEC (promedio de espera en cola), PTO; con varios puestos, PTO(i)
- **Estado:** TC (tiempo comprometido del puesto); con 2 puestos TC1 y TC2; con N puestos TC(i), 1 ≤ i ≤ N

Hay **un único evento, la LLEGADA**: la salida no es un evento, queda comprometida en TC.

| Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|
| LLEGADA | LLEGADA | --- | --- |

T.E.F. = TPLL

Cómo cambia TC (tabla de la clase): llamada a las 9:10 con viaje de 30' y TC = 9:20 → como T ≤ TC, el cliente espera y TC pasa a 9:50. Llamada a las 11:00 con viaje de 10' y TC = 10:30 → como T > TC, hubo ocio y TC pasa a 11:10.

Diagrama de flujo (en la clase va todo en el programa principal porque hay un solo evento; con la convención del tutor, es la rutina LLEGADA):
1. **C.I.**
2. `T = TPLL` (se avanza el tiempo: hay un único evento); generar IA; `TPLL = T + IA` (el E.F.NO C.); generar TA.
3. 1 puesto: ¿T ≥ TC? SI → `TC = T + TA` (el puesto estaba libre: ocio de T − TC). NO → `TC = TC + TA` (el cliente espera TC − T).
   2 puestos: ¿TC1 ≤ TC2? (qué puesto se desocupa primero) SI → ¿T ≥ TC1? SI: `TC1 = T + TA`; NO: `TC1 = TC1 + TA`. NO → lo mismo con TC2.
   N puestos: **Busco menor TC(i)** (el puesto que se desocupa primero) → ¿T ≥ TC(i)? SI: `TC(i) = T + TA`; NO: `TC(i) = TC(i) + TA`.
4. ¿T ≥ TF? NO → volver a 2. SI → resultados y FIN.
