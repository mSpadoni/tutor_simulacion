# Ejercicios resueltos (cátedra)

> tipo: ejercicio

Fuente: "Ej Resueltos EaE" (material de la cátedra). Análisis previo completo y, cuando el original lo trae, el diagrama de flujo pasado a pasos.
Las aclaraciones marcadas como "Nota" no están en el original: se agregaron para que el ejercicio se entienda sin el dibujo.

## Ejercicios resueltos

### Servidor web y base de datos (WBD)

Un servidor con procesamiento en paralelo dedica un núcleo al web-server y otro a la base de datos; las peticiones de cada tipo se encolan y se atienden por orden de llegada. Se busca la velocidad de procesamiento (MHz) óptima. Indicadores: porcentaje de tiempo ocioso del servidor y cantidad máxima de elementos en cada cola. Datos: intervalo entre arribos (fdp, milésimas de segundo); el 65% son peticiones de base de datos; tamaño de cada petición web y de base de datos (fdp, en cantidad de operaciones). Ambos núcleos tienen la misma velocidad. El servidor está ocioso cuando no atiende ni web ni base de datos.

Metodología: EaE. Cantidad de simulaciones: 1.

- **Datos:** IA, TAW (tamaño de petición web), TABD (tamaño de petición de base de datos)
- **Control:** VP (velocidad de procesamiento)
- **Resultado:** PTO, MAXW, MAXBD
- **Estado:** NSW, NSBD

| Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|
| Llegada de petición | Llegada de petición | Salida web / Salida BD | NSW = 1 / NSBD = 1 |
| Salida web | --- | Salida web | NSW > 0 |
| Salida BD | --- | Salida BD | NSBD > 0 |

T.E.F. = TPLL, TPSW, TPSBD

Nota: el tiempo de atención de cada petición sale de su tamaño dividido la velocidad VP.

### Banco de sangre

Se busca la cantidad mínima semanal de reserva (litros) que un banco de sangre provincial debe pedir al gobierno nacional. Recibe donaciones (cantidad por fdp en litros, a intervalos por fdp en días) y entrega a centros de salud (cantidad por fdp; intervalo entre entregas uniforme, en días). Si no tiene stock suficiente, recurre a la Nación por el faltante. Se pide: cantidad de veces que tuvo que recurrir a la Nación y la mayor cantidad solicitada.

Metodología: EaE.

- **Datos:** DON (cantidad donada), IAD (intervalo entre donaciones), CS (cantidad entregada a centros de salud), IE (intervalo entre entregas)
- **Control:** CMR (cantidad semanal a pedir)
- **Resultado:** CVF (cantidad de veces que faltó), MAY (mayor cantidad solicitada)
- **Estado:** ST_SANGRE (stock de sangre)

| Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|
| Donación | Donación | --- | --- |
| Entrega a CS | Entrega a CS | --- | --- |
| Recibe del gobierno | Recibe del gobierno | --- | --- |

T.E.F. = TPD, TPE, TPR

### Droguería de vacunas (vida útil de 7 días)

Una droguería vende vacunas con vida útil de 7 días desde que las recibe; cada semana destruye las no vendidas y recibe P vacunas frescas. Si se queda sin vacunas antes, pide y se adelanta la entrega siguiente, que tarda DE minutos, con fdp escalón: f(DE) = 0,2 entre 5 y a, y f(DE) = 0,1 entre a y 12. Los clientes compran a intervalos IV (fdp, minutos) una cantidad VAC (fdp). Se pide el porcentaje de vacunas destruidas respecto del total recibido y el porcentaje de ventas no satisfechas.

Metodología: EaE. Cantidad de simulaciones: 1.

- **Datos:** DE (demora de la entrega adelantada), VAC (vacunas por compra), IV (intervalo entre ventas)
- **Control:** P (vacunas por entrega)
- **Resultado:** PVD (porcentaje de vacunas destruidas), PDNS (porcentaje de ventas no satisfechas)
- **Estado:** STVAC (stock de vacunas), IP (indicador de pedido en curso)

| Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|
| Venta | Venta | Llegada pedido | STVAC = 0 y IP = 0 |
| Llegada pedido | Llegada pedido | --- | --- |

T.E.F. = TPV, TLLP

Nota: con la condición de área 1 de la fdp escalón, 0,2·(a − 5) + 0,1·(12 − a) = 1, sale a = 8.

### Compañía ferroviaria

Se busca la frecuencia y la formación (número de vagones) óptimas de los trenes de un ramal para evitar la saturación del andén (promedio de pasajeros esperando). Los pasajeros llegan al andén con fdp equiprobable entre 0 y 3 minutos y se reparten uniformemente a lo largo del andén. El tren llega con una cantidad de pasajeros por vagón entre 15 y 25 (fdp con el doble de probabilidad de 15 que de 25). Si hay lugar para todos, el andén se vacía; si no, suben hasta completar la capacidad (50 pasajeros por vagón) y el resto espera el próximo tren.

Metodología: EaE.

- **Datos:** IA (intervalo entre pasajeros), CP (pasajeros por vagón al llegar el tren)
- **Control:** IAT (intervalo entre trenes, la frecuencia), CAP (cantidad de vagones, la formación)
- **Resultado:** PPE (promedio de pasajeros esperando)
- **Estado:** NS (pasajeros en el andén)

| Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|
| Llegada de pasajero | Llegada de pasajero | --- | --- |
| Llega tren | Llega tren | --- | --- |

T.E.F. = TPLL, TPT

### Expendedor de agua (bidón de 90 litros)

Un expendedor de agua de 90 litros se repone con bidones sellados de 90 litros. El repositor pasa cada M días, saca el bidón tal como está (se desperdicia lo que quede) y pone uno lleno. Los empleados consumen a intervalos IV (fdp, minutos) una cantidad entre 50 y 250 cm³; si no queda agua, hacen un reclamo por escrito. Cada 5 litros desperdiciados se pierden $9. Se busca cada cuánto debe pasar el repositor para minimizar el costo por agua perdida y el promedio mensual de reclamos.

Metodología: EaE.

- **Datos:** IV (intervalo entre consumos), CONS (cantidad consumida)
- **Control:** M (días entre visitas del repositor)
- **Resultado:** CPA (costo por pérdida de agua), Q (cantidad de reclamos)
- **Estado:** STH2O (agua en el bidón)

| Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|
| Consumo de agua | Consumo de agua | --- | --- |
| Llegada del repositor | Llegada del repositor | --- | --- |

T.E.F. = TPC, TPR

Diagrama de flujo:
1. C.I.
2. ¿TPC < TPR?
   - SI → **Consumo**: T = TPC; generar IV; TPC = T + IV; generar CONS.
     - ¿CONS > STH2O? SI → STH2O = 0; Q = Q + 1 (reclamo). NO → STH2O = STH2O − CONS.
   - NO → **Reposición**: T = TPR; TPR = T + M.
     - ¿STH2O > 0? SI → DESP = DESP + STH2O (agua desperdiciada).
     - STH2O = 90.
3. ¿T < TF? SI → volver a 2. NO → calcular CPA a partir de DESP ($9 cada 5 litros) e imprimir M: CPA, Q.

### Remisería con N autos (tiempo comprometido)

Una remisería tiene N autos. Los clientes llegan a la agencia o llaman (intervalo por fdp). Al cliente se le informa la duración de su viaje: fdp lineal entre 10 y 30 minutos con f(30) = 3·f(10). El 50% está dispuesto a esperar 15 minutos, el 30% hasta 20 minutos y el resto se va a otra remisería. Los autos cargan combustible cada una cantidad de minutos (fdp), con una demora equiprobable entre 15 y 30 minutos. Se pide el promedio de espera de los clientes y el porcentaje de arrepentidos.

Metodología: EaE. Cantidad de simulaciones: 1.

- **Datos:** IA (intervalo entre clientes), TA (duración del viaje), DE (demora por carga de combustible), CC[i] (intervalo entre cargas del auto i)
- **Control:** N (cantidad de autos)
- **Resultado:** PE (promedio de espera)
- **Estado:** TC[i] (tiempo comprometido del auto i)

| Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|
| Llegada | Llegada | --- | --- |
| Carga de combustible i | Carga de combustible i | --- | --- |

T.E.F. = TPLL, TPCC[i]

Diagrama de flujo:
1. C.I.
2. Buscar el menor TPCC(i). ¿TPLL < TPCC(i)?
   - SI → **Llegada**: T = TPLL; generar IA; TPLL = T + IA; buscar el menor TC(i); rutina de arrepentimiento (según R, el cliente tolera 15 o 20 minutos o se va); generar TA.
     - ¿T < TC(i)? (el auto está comprometido: el cliente espera) SI → SE = SE + (TC(i) − T); TC(i) = TC(i) + TA. NO → TC(i) = T + TA.
     - CLL = CLL + 1.
   - NO → **Carga de combustible del auto i**: T = TPCC(i); generar CC; TPCC(i) = T + CC; generar DE; TC(i) = TC(i) + DE.
3. ¿T < TF? SI → volver a 2. NO → PE = SE / CLL; imprimir N: PE.

### Aeropuerto con N pistas (despegues y aterrizajes)

Se conocen los intervalos de arribo (IA) y de despegue (ID) de aviones chicos (50%), medianos (30%) y grandes (20%) de un aeropuerto que se va a ampliar con más pistas. Tiempos de despegue: chico 100–120 s, mediano 350–400 s, grande 700–900 s. Tiempos de aterrizaje: chico 180–200 s, mediano 450–490 s, grande 1000–1200 s. Los domingos el tráfico se reduce a la mitad. Se pide el promedio de espera para despegar y para aterrizar.

Metodología: EaE.

- **Datos:** IA, ID, TAAC, TAAM, TAAG (tiempos de aterrizaje por tamaño), TADC, TADM, TADG (tiempos de despegue por tamaño)
- **Control:** N (cantidad de pistas)
- **Resultado:** PED (promedio de espera para despegar), PEA (promedio de espera para aterrizar)
- **Estado:** TC(i) (tiempo comprometido de cada pista)

| Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|
| Aterrizaje | Aterrizaje | --- | --- |
| Despegue | Despegue | --- | --- |

T.E.F. = TPA, TPD

Diagrama de flujo:
1. C.I.
2. ¿TPA < TPD?
   - SI → **Aterrizaje**: T = TPA; generar IAA; TPA = T + IAA; buscar el menor TC(i); generar TAA.
     - ¿T < TC(i)? SI → SEA = SEA + (TC(i) − T); TC(i) = TC(i) + TAA. NO → TC(i) = T + TAA.
     - CLLA = CLLA + 1.
   - NO → **Despegue**: T = TPD; generar IAD; TPD = T + IAD; buscar el menor TC(i); generar TAD.
     - ¿T < TC(i)? SI → SED = SED + (TC(i) − T); TC(i) = TC(i) + TAD. NO → TC(i) = T + TAD.
     - CLLD = CLLD + 1.
3. ¿T < TF? SI → volver a 2. NO → PEA = SEA / CLLA; PED = SED / CLLD; imprimir N: PEA, PED.

### Rosquillas de Homero (planta nuclear de Springfield)

La planta recibe cada N minutos (desde el último pedido) 15 rosquillas a $5 cada una. El intervalo en que Homero quiere comer una rosquilla es una fdp lineal entre 20 y 30 minutos con f(30) = 2·f(20). Cuando Homero come la última, Smithers puede hacer un pedido "imprevisto" solo si falta más de cierto porcentaje de los N minutos; ese pedido cuesta entre $5,00 y $6,50 por rosquilla (equiprobable) y tarda 25 minutos. Si Homero quiere comer y no hay rosquillas, deja de trabajar hasta que llegue el pedido. Se buscan N y el porcentaje que minimicen el gasto, y el tiempo en que Homero no trabaja.

- **Datos:** IA (intervalo entre ganas de comer), CR (costo por rosquilla del pedido imprevisto)
- **Control:** N, PORC
- **Resultado:** GT (gasto total), PTO (porcentaje de tiempo sin trabajar)
- **Estado:** STR (stock de rosquillas), TLLR

| Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|
| Comer rosquilla | Comer rosquilla | Llegan rosquillas | STR = 1 y TIR − T ≥ N·PORC/100 |
| Llegan rosquillas | Llegan rosquillas | --- | --- |

T.E.F. = TCR, TLLR
