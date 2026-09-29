# BASE DE CONOCIMIENTO — SIMULACIÓN (Metodología Evento a Evento)
Cátedra: Simulación — UTN-FRBA (Ing. Erica Milin – Ing. David Mammana, 2C 2026). Uso: contexto para un chatbot tutor de ejercicios.
Fuentes principales: clases "Clase EaE" y "Clase N Colas" de la cátedra (2C 2026), más material resuelto.

---

## 1. CONCEPTOS GENERALES DE MODELOS

**Simulación y toma de decisiones** (clase EaE):
- La SIMULACIÓN es una herramienta (o técnica) que permite generar un modelo (representación de la realidad) con el objetivo de obtener la información necesaria para la toma de decisiones.
- Tomar una decisión es elegir una entre varias alternativas decisorias. Existe una relación que une cada alternativa decisoria U(i) con un resultado Y(i): **Y(i) = R[U(i)]**.
- Realidad → modelo: sobre los DATOS (f.d.p.) obtenidos de la realidad se aplican **hipótesis de simplificación** para poder usarlos en el modelo. Realismo y simplicidad están en conflicto.
- En el **diseño del experimento** se define la cantidad de corridas: una corrida para cada alternativa decisoria (cada valor de las variables de control).
- Los modelos de la materia son **estocásticos** (al menos una característica de operación es una f.d.p.) y **dinámicos** (reflejan los cambios del sistema a través del tiempo).

**Clasificación de modelos:**
- Por aleatoriedad: **Determinísticos** (sin variables al azar, se resuelven con IO clásica) vs **Estocásticos** (al menos una variable es una f.d.p.; se resuelven con simulación).
- Por el tiempo: **Estáticos** (no consideran el tiempo) vs **Dinámicos** (evolucionan en el tiempo).

**Metodologías de avance del tiempo:**
1. **Evento a Evento (EaE)** — la que se está viendo ahora. Los intervalos de tiempo entre eventos son irregulares.
2. Intervalos constantes de tiempo (Δt) — la cátedra la ve más adelante: por ahora el tutor no propone ni corrige ejercicios de Δt.

Pasos de la metodología EaE (clase EaE):
1. Estoy en el instante 0 (inicial).
2. Determino en qué momento va a ocurrir el próximo evento (en el futuro).
3. Avanzo el tiempo hasta ese momento.
4. Me ocupo del evento (y solamente de ese evento).
5. Al terminar, vuelvo a ubicar el próximo evento y avanzo el tiempo hasta ese ("nuevo") momento.

Características: en cada avance del tiempo me ocupo solamente de UN evento; la mirada es siempre hacia ADELANTE; para aplicarla se necesita al menos un DATO que encadene eventos.

Casos típicos de EaE: sistemas de colas, colas con prioridades, transporte (además de tiempo comprometido, mantenimiento y stock en el material de práctica).
El **análisis previo** es: definir la metodología de avance del tiempo → clasificar las variables → definir los eventos (T.E.I. y T.E.F.).

---

## 2. CLASIFICACIÓN DE VARIABLES (paso obligatorio del Análisis Previo)

- **Exógenas**: independientes, entrada del modelo.
  - **De Control** (controlables): instrumentales, gobiernan el sistema; se fijan según la estrategia para barrer la superficie de resultados. Contienen las alternativas decisorias (ej: N cantidad de puestos, PM plazo de mantenimiento).
  - **No controlables (Datos)**: verdaderos datos de la realidad, imposibles de modificar, responden a una f.d.p. (ej: IA intervalo entre arribos, TA tiempo de atención).
  - **Regla de la cátedra: los datos son funciones, valores que varían. NO son valores fijos ni porcentajes fijos.** Ej.: "el 65% son peticiones de base de datos" o "un costo de $5 por unidad" no son Datos. Error común: listarlos como Datos.
- **Endógenas**: dependientes del sistema, varían durante la corrida.
  - **De Estado**: describen el estado del sistema o de uno de sus componentes (ej: NS cantidad en el sistema, STSangre stock disponible). El vector de estado muestra una "foto" del sistema en el instante en que se lo consulta, y refleja los cambios producidos por los eventos. Un evento no modifica todas las variables del vector de estado al mismo tiempo.
  - **De Resultado**: salida del modelo, lo que se quiere medir; se generan por la interacción de las exógenas y las de estado (ej: PPS promedio de permanencia, PTO % tiempo ocioso).
- Si el enunciado no tiene variable de control, se escribe `Control: ---`.

**Cómo deducirlas leyendo el enunciado** (razonalo en cada ejercicio; no copies las de un caso parecido):
- **Datos**: las magnitudes que varían al azar. Hay tres formas de reconocerlas:
  1. Responden a una f.d.p. (explícita o "conocida"): "el intervalo entre arribos responde a una f.d.p. uniforme entre 5 y 15 minutos" → IA.
  2. Varían según probabilidades, porque es más probable que pase una cosa que otra: "el 60% de los clientes tarda 40 minutos y el resto 20" → TA es un dato (con una f.d.p. discreta). El dato es la magnitud que varía (TA), no el porcentaje.
  3. Salen de uno de los anteriores con una transformación: "el intervalo de los camiones grandes es el doble que el de los chicos" → IA1 = 2·IA2, IA1 también es dato.
  - Un porcentaje que solo decide un camino (se arrepiente o no, qué tipo de cliente es) se resuelve con un número aleatorio R dentro del evento, en el diagrama; no se lista como dato. Tampoco un valor fijo (un costo, una capacidad).
- **Estado**: las que cambian cuando sucede un evento (NS, NS(i), el stock). Prueba: si ningún evento la modifica, no es de estado.
- **Control**: las que nosotros podemos cambiar para tomar una decisión: la cantidad de puestos, la capacidad, cuánto pedir. Es lo que el enunciado pide determinar ("se desea determinar la cantidad N de…").
- **Resultado**: lo que el enunciado pide obtener; casi siempre está explícito ("se desea conocer…", "obtener el porcentaje de…", "el promedio de…").

Formato estándar de respuesta:
```
Datos: ...
Control: ...
Resultado: ...
Estado: ...
```

---

## 3. CLASIFICACIÓN DE EVENTOS

Un **evento** es un hecho o acontecimiento que se produce en el sistema. Definición circular (clase EaE): "si sucede un evento, cambia el vector de estado; y si cambia el vector de estado, se produjo un evento".
**Un evento es solo lo que modifica al menos una variable de estado.** Si algo no cambia ninguna (arrepentirse, elegir una cola, decidir si se atiende), no es un evento: es una decisión dentro de un evento, y va en su diagrama.
**"Generar un evento" es poder decir de manera exacta cuándo va a suceder otro evento.** Ej.: en una LLEGADA a las 10:00 genero IA = 12' → TPLL = 10:12.

### Tabla de Eventos Independientes (T.E.I.)
Tiene tantas filas como eventos independientes tenga el modelo (una por evento) y **tres columnas**: **EVENTO | E.F.NO C. | E.F.C.**, más una **columna anexa CONDICIÓN** (no es parte de la T.E.I.; tiene las condiciones para que suceda el E.F.C.).
- **E.F.NO C.** (Evento Futuro NO Condicionado): se genera como consecuencia del evento actual; a partir de los datos puedo decir cuándo va a volver a suceder.
- **E.F.C.** (Evento Futuro Condicionado): también se genera por el evento actual, pero solo si se cumple cierta condición.

Reglas de la T.E.I. (clase EaE):
1. En la tabla solo pueden escribirse eventos independientes (ninguna otra cosa).
2. En **E.F.NO C.** debe escribirse el mismo evento de la fila que le dio origen, o nada (`---`): un evento independiente no puede generar, sin que medie condición alguna, otro evento distinto de sí mismo. Ejemplo de la cátedra: "tirar una mesa" y "muerte de un perro" son independientes; tirar una mesa NO genera como E.F.NO C. la muerte de un perro. Solo con condiciones (mesa ≥ 100 kg, perro caniche toy, tirada justo encima) sería un E.F.C.
3. **Columna anexa CONDICIÓN**: expresa la condición que encadena eventos, por lo tanto las variables que aparecen solo pueden ser **de estado**. También se pueden escribir valores fijos o que permanecen constantes durante la corrida (control) y, eventualmente, variables relacionadas con el tiempo (de la T.E.F., por ejemplo).

### Tabla de Eventos Futuros (T.E.F.)
Se llena al mismo tiempo que la T.E.I.: está formada por las variables que contienen el momento (tiempo) en que se producirá cada tipo de evento (ej: TPLL = tiempo de próxima llegada, TPS = tiempo de próxima salida).

---

## 4. GENERACIÓN DE VARIABLES ALEATORIAS

Todo dato que es una f.d.p. debe generarse a partir de un número aleatorio uniforme R (0 ≤ R ≤ 1) que da la computadora.

### Método de la función inversa (para f.d.p. simples e integrables)
Pasos:
1. Escribir f(x) en el intervalo dado.
2. Integrar para obtener F(x) (acumulada), hallando la constante con una condición de borde (ej: F(a)=0).
3. Igualar F(x) = R.
4. Despejar x en función de R → esa es la fórmula generadora.

Ejemplos ya derivados:
- **Uniforme entre a y b**: `x = a + (b-a)·R`
- **Exponencial** f(x)=λe^(-λx): `x = -(1/λ)·ln(1-R)`
- Cuando f(x) es lineal tipo y=mx+b entre dos extremos con una relación entre f(extremo1) y f(extremo2) (ej: "f(45)=3·f(15)"), primero hay que armar el sistema de ecuaciones con la condición de área=1 bajo la curva para hallar m y b, y luego integrar igual que arriba.

### Método del rechazo (cuando la función no es fácilmente integrable/invertible, ej: polinomios de grado ≥2, funciones acotadas complejas)
Pasos (ver diagrama tipo en el material):
1. Definir el intervalo [a,b] de la variable y M = valor igual o mayor al máximo de f(x) en ese intervalo.
2. Generar R1 y R2 (dos números aleatorios independientes).
3. `Xi = a + (b-a)·R1` (candidato de abscisa)
4. `Yi = M·R2` (candidato de ordenada)
5. Evaluar f(Xi).
6. Si `Yi <= f(Xi)` → se ACEPTA, la variable generada es `x = Xi`. Si no, se rechaza y se vuelve al paso 2 (nuevo R1, R2).
- Eficiencia del método: `e = área bajo la curva / área del rectángulo = 1 / [M·(b-a)]`. Cuanto más ajustado M al máximo real, menos rechazos.

---

## 5. CONVENCIÓN DE DIAGRAMAS DE FLUJO (EaE)

### Los pasos de la metodología Evento a Evento (clase "Metodología EaE — Pasos", Ing. Milin – Ing. Mammana)
Es la secuencia que sigue **cualquier** simulación Evento a Evento. Con estos pasos se arma el diagrama de cualquier ejercicio, aunque no se parezca a ningún caso conocido:
1. **Fijación de las condiciones iniciales del modelo** (C.I.).
2. **Determinación del instante T en que ocurrirá el próximo evento**: se mira la T.E.F. y se busca el menor de todos los tiempos que aparecen (ej. ¿TPLL ≤ TPS?; con N puestos, primero MENOR TPS(i)).
3. **Avance del tiempo hasta ese instante T** (T = TPLL, T = TPS(i)…).
4. **Determinación del tipo de evento que ocurre en el instante T** (el que tenía ese tiempo en la T.E.F.).
5. **Determinación de los instantes en que ocurrirán los eventos futuros NO condicionados** consecuencia del evento actual: se genera el dato y se actualiza la T.E.F. (ej. generar IA; TPLL = T + IA).
6. **Actualización del vector de estado del modelo** (ej. NS = NS + 1). Es un buen momento para pensar en los **resultados**: acá se actualizan los acumuladores (STS, STO, CLL, CARR…).
7. **Determinación de los instantes en que ocurrirán los eventos futuros condicionados** consecuencia del evento actual: si se cumple la condición de la T.E.I., se genera el dato y se actualiza la T.E.F. (ej. ¿NS = 1? → generar TA; TPS = T + TA).
8. **¿Fin de la simulación?** NO → volver al paso 2. SI → **cálculo de resultados** → **impresión de resultados** → parar.

La T.E.F. alimenta los pasos 2 y 4 (de ahí sale el próximo evento) y la actualizan los pasos 5 y 7. Cada rutina de evento del diagrama es, en orden, los pasos 3, 5, 6 y 7 para ese evento.

Estructura típica de un diagrama:
1. **C.I.** (Condiciones Iniciales): casi todos los valores en 0 (T, TPLL, NS, acumuladores) y **TPS = HV** para que lo primero sea una llegada. Con N puestos: `TPS(i) = HV`, `ITO(i) = STO(i) = NS(i) = 0` para i = 1..N.
2. Determinar cuál es el PRÓXIMO evento: ir a la T.E.F. y buscar el menor de todos (ej: `TPLL ≤ TPS?` → SI: llegada; NO: salida. Con empate va la llegada). Con N puestos primero se busca el menor TPS(i) (rutina "MENOR TPS(i)": `MEN = HV`; para j = 1..N, si `TPS(j) < MEN` → `i = j`, `MEN = TPS(j)`).
3. **Avanzar el tiempo**: `T = TPLL` (o el evento futuro que corresponda).
4. Ejecutar la lógica propia de ESE evento (actualizar variables de estado, generar el próximo TEF de ese tipo de evento, actualizar variables de resultado tipo acumuladores).
5. Verificar condición de corte: `T < TF?` (o `T ≤ TF?`; TF = tiempo final de la corrida). Si es verdadero, volver al paso 2. Si no, hacer el vaciamiento (sección 9) y después calcular e imprimir los resultados.

Diagrama completo del caso base (1 puesto, 1 cola, sistema cautivo — clase EaE, con el método "anterior" de permanencia):
- C.I. → ¿TPLL ≤ TPS?
- **LLEGADA** (SI): `T = TPLL` → generar IA → `TPLL = T + IA` → `STLL = STLL + T` → `NS = NS + 1` → `CLL = CLL + 1` → ¿NS = 1? SI: generar TA → `TPS = T + TA` → `STO = STO + (T − ITO)`.
- **SALIDA** (NO): `T = TPS` → `STS = STS + T` → `NS = NS − 1` → ¿NS > 0? SI: generar TA → `TPS = T + TA`. NO: `ITO = T` → `TPS = HV`.
- ¿T < TF? SI → volver. NO → vaciamiento: ¿NS = 0? NO → `TPLL = HV` y volver. SI → `PPS = (STS − STLL) / CLL`, `PTO = STO · 100 / T` → imprimir PPS, PTO.
- Por qué `TPS = HV` en la salida: si no queda nadie y no se actualiza TPS, el modelo queda en un loop sin avanzar; con HV se fuerza que el próximo evento sea una LLEGADA.
- Software de la cátedra: **Victoria** (Campus Virtual): análisis previo, generar diagrama y simular. La cátedra pide hacer la "prueba de escritorio" del modelo.

Convenciones de símbolos de la cátedra (las mismas que usa el tutor al dibujar):
- Proceso predefinido (rectángulo con doble barra lateral): C.I.
- Rectángulo: asignación/cálculo.
- Rombo: decisión, con las ramas SI / NO.
- Hexágono: llamada a otra rutina — generar una variable aleatoria (IA, TA, Random(r)), buscar un índice (MENOR TPS(i), MENOR NS(x), puesto libre), un evento (LLEGADA, SALIDA), arrepentimiento, vaciamiento.
- Paralelogramo: impresión de resultados.
- Círculo: FIN del programa (y "R", fin de una rutina que vuelve al programa principal).
- Círculo azul con una letra: conector. **A** vuelve al ciclo: sale de la rama SI de ¿T < TF? y se une a la línea que sale de las C.I. **B** es el arrepentimiento: el que se va salta a B, que se une justo antes de ¿T < TF?. Los ciclos dentro de una rutina usan C, D…
- Punto de unión: donde se juntan varias líneas antes de entrar a un nodo; de ahí sale una sola flecha.
- El diagrama se dibuja en partes: el programa principal y una parte por cada rutina.

Patrones recurrentes:
- **Tiempo Comprometido (TC)**: usado cuando un recurso, una vez que empieza a atender, ya sabe cuánto va a tardar (a diferencia de cuando el TA se conoce recién al comenzar la atención). Ejemplo remisería: cada auto que sale "compromete" un tiempo TC = T + TA; si llega una llamada antes de que se libere (T ≤ TC) el cliente espera; si T > TC hay ocio. Hay un único evento (LLEGADA): ver los casos de tiempo comprometido en la sección 6.
- **Acumuladores de ocio**: `STO = STO + (T - ITO)` donde ITO es el instante en que el recurso quedó libre (Inicio Tiempo Ocio). Al final: `PTO = STO*100/T`.
- **Acumuladores de permanencia**: `STS = STS + (TPLL-T)*NS` (o similar) sumado en cada avance de tiempo para ponderar por la cantidad de elementos en el sistema; `PPS = STS/CLL` (CLL = cantidad de llegadas).
- **Colas con N puestos, 1 sola cola**: el cliente entra si `NS <= N`; busca puesto libre y asigna `TPS(x) = T+TA`.
- **Colas con N puestos, N colas** (cada uno con su cola): el cliente se ubica en la cola con MENOR NS(i); si hay empate, convención propia del enunciado (ej: la última cola).
- **Colas con prioridades**: dos o más colas (A de mayor prioridad, B menor); la condición de "Salida A" y "Salida B" depende de NSA y NSB combinados (se atiende primero A si hay gente esperando en A).
- **Eventos dependientes/condicionados** (ej. mantenimiento con rotura de piezas): un evento (ej: ROTURA) puede derivar en sub-casos (cambiar 1 pieza o las 2) según una condición sobre variables de estado/control (ej: `TMP - T < PM*PORC/100`).

---

## 6. CASOS DE REFERENCIA (resueltos, usar como ejemplos/plantilla)

### Caso: Banco de Sangre (almacenamiento intermedio)
- Datos: ID (intervalo entre donaciones, días), CD (cantidad donada, litros), IE (intervalo entre entregas, días), CE (cantidad entregada, litros).
- Control: Cant (cantidad a solicitar al Gob. Nacional).
- Resultado: Por (% de veces que faltó stock), MAY (mayor cantidad solicitada).
- Estado: STSangre (stock disponible).
- Eventos: Llegada de donación (+STSangre), Llegada de stock del gobierno (+STSangre), Entrega a centros de salud (-STSangre; si no alcanza, se pide al gobierno y se registra en Por/MAY).

### Caso: Pastelería (crema chantilly)
- Datos: IA (intervalo entre arribo de clientes, minutos), CCD (crema usada por torta, kg).
- Control: Q (cantidad de crema a preparar), N (minutos entre preparaciones).
- Resultado: CM (costo mensual = fijo + variable).
- Estado: STCrema (crema disponible).
- Lógica: cada N minutos se prepara Q kg a $5/kg + $50 fijo; si se agota antes, se prepara sobre la marcha lo justo a $8,50/kg (costo variable más caro) — el objetivo de la simulación es optimizar Q y N para minimizar el costo variable.

**Cómo usar estos casos:** primero razoná el ejercicio desde su enunciado (secciones 2 y 3: qué varía al azar, qué se decide, qué cambia con cada evento, qué se pide). Después contrastá con el caso más parecido para verificar. No copies un caso: un ejercicio de parcial combina dos o tres y cambia los nombres.

### Caso: Colas — 1 puesto, 1 cola (clase de EaE)
- Datos: IA, TA. Control: ---. Resultado: PPS, PTO. Estado: NS.
- T.E.I.: LLEGADA | E.F.NO C.: LLEGADA | E.F.C.: SALIDA si NS = 1. SALIDA | E.F.NO C.: --- | E.F.C.: SALIDA si NS > 0 (NS ya descontado).
- T.E.F.: TPLL, TPS.
- Fórmulas: `PPS = (STS − STLL)/CLL` o con el acumulador ponderado; `PTO = STO·100/T`.

### Caso: Colas — N puestos, 1 sola cola (fila única)
- Datos: IA, TA. Control: N (cantidad de puestos). Resultado: PPS, PTO(i). Estado: NS (una sola cola para todos).
- T.E.I.: LLEGADA | E.F.NO C.: LLEGADA | E.F.C.: SALIDA(i) si NS ≤ N (hay un puesto libre: entra directo y puedo calcular su salida). SALIDA(i) | --- | E.F.C.: SALIDA(i) si NS ≥ N (NS ya descontado: queda alguien esperando que pasa a ese puesto).
- T.E.F.: TPLL, TPS(i).
- Diagrama: MENOR TPS(i) antes de ¿TPLL ≤ TPS(i)?; en la LLEGADA, si NS ≤ N se busca un puesto libre (el que tiene TPS(i) = HV).

### Caso: Colas — N puestos, N colas (cada puesto con su fila)
- Datos: IA, TA. Control: N. Resultado: PPS, PTO(i). Estado: NS(i), la cantidad en cada cola.
- T.E.I.: LLEGADA | E.F.NO C.: LLEGADA | E.F.C.: SALIDA(i) si NS(i) = 1. SALIDA(i) | --- | E.F.C.: SALIDA(i) si NS(i) > 0.
- T.E.F.: TPLL, TPS(i).
- Diagrama: MENOR TPS(i) antes de ¿TPLL ≤ TPS(i)?; en la LLEGADA, MENOR NS(i) para elegir la fila con menos gente, y NS(i) = NS(i) + 1. Con 2 puestos es igual con NS1, NS2, TPS1, TPS2.

### Caso: Colas con prioridades (2 colas, 2 puestos, la cola 1 con prioridad)
- Datos: IA, TA1, TA2. Control: ---. Resultado: PEC, PPS, PTO(i). Estado: NS1, NS2.
- Eventos: LLEGADA (E.F.NO C.: LLEGADA; E.F.C.: SALIDA1 y SALIDA2), SALIDA1 (E.F.C.: SALIDA1), SALIDA2 (E.F.C.: SALIDA2). T.E.F.: TPLL, TPS1, TPS2.
- El puesto 2 atiende su fila solo si no hay nadie en la fila 1. Las condiciones las piensa el alumno (la cátedra las deja como ejercicio): guialo con preguntas.

### Caso: Arrepentimiento (se agrega a cualquier caso de colas)
- No es un evento: es una decisión dentro de la LLEGADA. Se genera **un único R** y se compara con el porcentaje del tramo que corresponde según cuántos hay. Si se arrepiente, se cuenta (CARR) y **no se actualiza NS**. Resultado típico: PARR = CARR·100/CLL.

### Caso: Tiempo comprometido — 1 puesto (clase "Remisería")
Se usa cuando **el tiempo de atención se conoce desde la llegada** del cliente: al llegar ya se sabe hasta cuándo queda ocupado el puesto.
- Datos: IA, TA. Control: --- (implícita). Resultado: PEC (promedio de espera en cola), PTO. Estado: **TC** (tiempo comprometido: hasta cuándo está ocupado el puesto).
- **Hay un único evento, la LLEGADA** (no hay SALIDA: la salida queda comprometida en TC). T.E.I.: LLEGADA | E.F.NO C.: LLEGADA | E.F.C.: --- | CONDICIÓN: ---. T.E.F.: TPLL.
- Diagrama de la LLEGADA: `T = TPLL` → IA → `TPLL = T + IA` → TA → ¿T ≥ TC? SI (el puesto está libre: hubo ocio de T − TC) → `TC = T + TA`. NO (el cliente espera TC − T) → `TC = TC + TA`.

### Caso: Tiempo comprometido — 2 puestos
- Datos: IA, TA. Control: --- (implícita). Resultado: PTO1, PTO2. Estado: TC1, TC2. El cliente va al puesto donde espera menos.
- T.E.I. y T.E.F.: iguales al de 1 puesto (un único evento, LLEGADA; T.E.F.: TPLL).
- Diagrama de la LLEGADA: … TA → ¿TC1 ≤ TC2? (qué puesto se desocupa primero) SI → ¿T ≥ TC1? SI: `TC1 = T + TA`; NO: `TC1 = TC1 + TA`. NO → lo mismo con TC2.

### Caso: Tiempo comprometido — N puestos
- Datos: IA, TA. Control: N (cantidad de puestos). Resultado: PTO(i). Estado: TC(i), 1 ≤ i ≤ N.
- T.E.I. y T.E.F.: iguales (un único evento, LLEGADA; T.E.F.: TPLL).
- Diagrama de la LLEGADA: … TA → **Busco menor TC(i)** (hexágono: el puesto que se desocupa primero) → ¿T ≥ TC(i)? SI: `TC(i) = T + TA`; NO: `TC(i) = TC(i) + TA`.

### Caso: Transporte (camiones con balsa/túnel de paso único)
Concepto de **Tiempo Comprometido de un recurso compartido de paso único** (balsa, túnel): TCB/TCT = el momento en que el recurso vuelve a estar libre. Un camión que llega antes de TCB debe esperar hasta TCB para cruzar; si llega después, cruza directo y actualiza TCB = su propio tiempo de cruce + duración.

### Caso: Mantenimiento (piezas A y B, eventos dependientes)
Datos: VUA, VUB (vidas útiles), CRA, CRB, CR2 (costos de recambio). Control: PM (plazo de mantenimiento preventivo), PORC (% de decisión). Resultado: CTM (costo total).
Lógica de decisión: si se rompe una pieza y falta poco para el próximo mantenimiento preventivo (`TMP - T < PM*PORC/100`), se cambian las DOS piezas de una vez (más barato a largo plazo) y se reprograma TMP; si no, se cambia solo la pieza rota y TMP no cambia.

---

## 7. CÓMO EVALUAR O GUIAR UN EJERCICIO (para el bot-tutor)

Ante un enunciado nuevo, la secuencia esperada de un alumno (y lo que el bot debe pedir/corregir en orden) es:
1. **Metodología**: identificar que corresponde EaE (casi siempre en esta materia).
2. **Clasificación de variables**: Datos / Control / Resultado / Estado (ver sección 2). Errores comunes: confundir una variable de Estado con una de Resultado, listar una f.d.p. como si fuera de Control, o listar como Dato un valor fijo o un porcentaje fijo (los datos son funciones).
3. **Clasificación de eventos**: armar la T.E.I. completa (evento, EFNC, EFC, condición) y la T.E.F. Error común: poner en EFNC un evento distinto al que originó la fila, o poner una variable que no es de estado en la columna condición.
4. **Diagrama de flujo**: siguiendo la estructura de la sección 5 (C.I. → determinar próximo evento → avanzar T → ejecutar lógica del evento → chequear T<TF → repetir/fin).
5. Si el enunciado incluye una f.d.p. no uniforme, pedir/verificar la generación de esa variable aleatoria (método de la inversa o del rechazo, sección 4).

Al corregir, el bot debe señalar en qué paso específico está el error (no solo decir "está mal"), y puede reusar el caso de referencia más parecido de la sección 6 como plantilla de comparación.

### Cómo resolver un ejercicio desde cero (sin un caso parecido)
1. **Datos, control y resultados** desde el enunciado, con las reglas de la sección 2: qué varía al azar (datos), qué se busca decidir (control), qué se pide obtener (resultados).
2. **Estado**: qué describe cómo está el sistema en cada momento (cuántos hay en cada cola, el stock, hasta cuándo está ocupado un puesto).
3. **Eventos**: qué hechos modifican esas variables de estado (sección 3). Lo que no modifica ninguna es una decisión dentro de un evento, no un evento.
4. **T.E.F.**: una variable de tiempo por cada evento (TPLL, TPS(i), TC…).
5. **T.E.I.**, evento por evento: ¿con un dato puedo decir cuándo vuelve a pasar este mismo evento, sin ninguna condición? → E.F.NO C. ¿Qué otros eventos puedo programar desde este, y bajo qué condición sobre las variables de estado? → E.F.C. con su condición.
6. **Diagrama**: los pasos de la metodología (sección 5). Cada rutina de evento: avanzar el tiempo, E.F.NO C., actualizar el estado y los acumuladores, E.F.C.
7. **Contrastar** con el caso más parecido de la sección 6, si hay uno. Si no hay, alcanza con los pasos.

## 8. CÓMO GENERAR UN EJERCICIO NUEVO (para modo simulacro)

**Qué sistemas.** Por ahora solo sistemas que se resuelven con Evento a Evento (Δt todavía no se vio). Esto es un criterio interno para elegir el sistema: **el enunciado nunca dice la metodología**, porque elegirla es parte de lo que resuelve el alumno.

**De dónde sale.** El tipo de ejercicio que se le da al alumno es el de la Guía Anexa, los parciales, los ejercicios resueltos de la cátedra y la guía oficial del 9 al 12. Esos ejercicios son **inspiración**: el ejercicio nuevo se crea **desde cero** (otro dominio, otro título, otra historia y otros datos), combinando el tipo de sistema y las complicaciones de la inspiración con un esqueleto de la sección 6, las clases y los modelos de la guía oficial (1 a 8). Nunca se devuelve un ejercicio de la cátedra tal cual ni cambiándole solo los números. **La redacción y la complejidad son las de la anexa y los parciales**. Los modelos (guía oficial 1 a 8 y los ejercicios de las clases) no se dan como ejercicio: son para explicar.

**Cómo se redacta** (como en la Guía Anexa y los parciales):
- Un **título corto** con el dominio ("Clínica", "Garage", "Salón de ventas").
- El **sistema contado en prosa**, en lenguaje del dominio (clientes, pacientes, pedidos, vehículos), sin vocabulario de la materia. Puede ser un pedido en primera persona (como el mail del gerente en "WBD").
- Los **datos**, de alguna de estas formas (como en la cátedra):
  - responden a una f.d.p. explícita, en el estilo de la cátedra: "responde a una f.d.p. equiprobable entre 10 y 35 minutos", "lineal donde f(20) = 2·f(10)", "entre 2 y 8 horas con f(x) = (x−1)/24";
  - responden a una f.d.p. conocida: "responde a una f.d.p. conocida";
  - salen de otro dato: "el tiempo de los camiones grandes es el doble que el de los chicos";
  - toman distintos valores según probabilidades: "el 60% de los clientes tarda 40 minutos y el resto 20".
  **Sin nombrar la variable**: ni siglas ni nombres (nada de "(IA)" o "(TA)"); qué variable es cada dato lo deduce el alumno. Nunca "distribución" ni "f(x)" suelta.
- **Porcentajes y reglas del dominio** que generan las complicaciones: arrepentimiento según la cola, prioridades, rotura o rechazo con probabilidad, asignación al puesto que se desocupa primero o al de menor cola, reposición cada cierto tiempo.
- **Qué se busca decidir** (las variables de control, sin llamarlas así) y **qué se quiere medir**: "Se desea determinar la cantidad N de …, para ello se estudiará el porcentaje de … y el promedio de …".
- La **consigna**, como en la guía y los parciales: "Se pide: a) Análisis completo: Metodología, clasificación de variables, tabla de eventos independientes, tabla de eventos futuros. b) Diagrama de flujo. c) Resolver las f.d.p. por el método más conveniente."

**Complejidad de parcial.** Un ejercicio de la anexa o de un parcial no es un sistema de cola simple. Tiene:
- **Dos o tres complicaciones combinadas**, por ejemplo: N puestos con N colas + arrepentimiento por tramos; tiempo comprometido + dos tipos de cliente con distinto tiempo de atención; prioridades + un puesto que atiende las dos filas; stock + reposición anticipada + rechazo del pedido; puestos que se rompen o hacen una pausa cada cierto tiempo.
- **Varios datos**, y al menos uno con una f.d.p. para resolver en el punto c) que no sea uniforme (lineal con su recta, una f(x) explícita, una empírica por porcentajes).
- **Una decisión** (lo que se busca determinar) y **dos o tres resultados** para medirla.
- **El largo de la anexa**: los enunciados de la Guía Anexa tienen alrededor de 1100 caracteres (los más cortos, unos 800) y los de parciales, más. Un enunciado de 3 o 4 líneas es un ejercicio de clase, no de parcial.

**Coherencia del sistema** (revisalo antes de darlo; un enunciado incoherente no se puede resolver):
- **La estructura queda fija durante toda la corrida.** La cantidad de puestos, la capacidad o el tamaño del stock no cambian a mitad de la simulación ("si hay más de 4, se abre otro puesto" no va). Lo que se busca decidir (N puestos, capacidad, cantidad a pedir) es una variable de control: se fija al empezar la corrida y el enunciado pide encontrar el valor conveniente.
- **Cada f.d.p. se puede resolver con lo que dice el enunciado.** Uniforme: entre a y b. Lineal: entre a y b **y la relación** que define la recta ("donde f(30) = 2·f(10)") o la f(x) explícita. Exponencial: su media. Una "f.d.p. lineal entre 10 y 30" sola no alcanza.
- **Las reglas no se pisan ni dejan huecos.** Si el arrepentimiento depende de cuántas personas hay, los rangos cubren todos los casos sin superponerse ("hasta 4 se quedan; entre 5 y 7 se va el 50%; con más de 7 se va el 80%"), y ninguna otra regla del enunciado usa la misma condición para otra cosa.
- **Cada complicación se modela con lo que vio la cátedra:** arrepentimiento, prioridades, N puestos con una o N colas, tiempo comprometido, stock con reposición, rechazo con probabilidad. Nada que obligue a inventar eventos que no son independientes.
- **Los resultados se pueden medir con la simulación** y se nombran con precisión: "el porcentaje de tiempo ocioso de cada puesto", "el promedio de espera en cola", "el porcentaje de clientes que se van sin ser atendidos". No "el número promedio de participantes en las sesiones".

**Qué no va nunca en el enunciado:** el nombre de la metodología ("evento a evento", "EaE", "intervalos constantes", "Δt"); nombres de eventos, variables de estado o de tiempo (TPLL, TPS, NS, TC, TEF, TEI); la clasificación de variables; ni pistas de cómo se resuelve.

## 9. CONCEPTOS QUE SE TOMAN EN LOS PARCIALITOS

Sacados de las clases de la cátedra (EaE y N colas, 2C 2026) y del material resuelto.

- **HV (High Value)**: valor muy grande que se le asigna a una variable de la T.E.F. cuando ese evento no puede ocurrir. Ej.: `TPS(i) = HV` cuando el puesto i queda vacío; `TPLL = HV` para que no entren más clientes en el vaciamiento.
- **ITO / STO (tiempo ocioso)**: ITO = Inicio del Tiempo Ocioso, STO = Sumatoria de Tiempo Ocioso. Cuando un puesto queda libre (salida con NS = 0) se guarda `ITO(i) = T`; cuando vuelve a atender (llegada con el puesto libre), `STO(i) = STO(i) + (T − ITO(i))`. Al final, `PTO(i) = STO(i) · 100 / T`.
- **Vaciamiento**: consiste en no "cortar" la simulación al cumplirse TF, sino seguir iterando para producir salidas hasta que no quede nadie en el sistema (NS = 0); para que no entre nadie más se hace `TPLL = HV`. Es lo que pasa en los sistemas reales: se cierran las puertas y se sigue atendiendo hasta el último cliente. Se ubica en la rama NO de `T < TF?`, antes de calcular los resultados (con N colas se recorre el vector NS(i) para ver si queda alguien). **"Siempre que se pueda se debe hacer vaciamiento"**: si el sistema no lo contempla, el método "anterior" de permanencia NO funciona.
- **Arrepentimiento**: en colas con personas suele haber un porcentaje que se va según cuánta gente hay en la cola. Ejemplo de la clase: hasta 10 personas en la cola nadie se va; entre 11 y 20 se va el 40%; más de 20 se van todos. Se hace con una **rutina ARR en la rama de LLEGADA**, generando **un único R** (equiprobable entre 0 y 1): ¿NS ≤ 10? SI → se queda. NO → ¿NS ≤ 20? SI → ¿R ≤ 0,4? SI → se va (`CARR = CARR + 1`); NO → se queda. NO → se va (`CARR = CARR + 1`). CARR = cantidad de arrepentidos. **¡NUNCA se actualiza el vector de estado (NS) si el cliente se arrepintió!** Aunque se arrepienta, la llegada ocurrió igual: el tiempo ya avanzó (`T = TPLL`) y se genera la próxima llegada.
- **Cálculo de la permanencia en el sistema (PPS) — dos métodos** (clase EaE):
  - La permanencia de cada cliente es su tiempo de salida menos su tiempo de llegada (TSi − TLLi); el PPS es la suma de esas permanencias dividida la cantidad de clientes (CLL).
  - **Método "anterior" (sumatorias)**: por propiedad distributiva, Σ(TSi − TLLi) = ΣTS − ΣTLL. En cada llegada `STLL = STLL + T`, en cada salida `STS = STS + T`, y al final `PPS = (STS − STLL) / CLL`. Necesita **vaciamiento**: si quedan clientes adentro, su llegada está sumada pero su salida no, y el promedio da mal.
  - **Método "nuevo" (tiempo entre eventos)**: entre dos eventos se multiplica la cantidad de personas en el sistema por el intervalo de tiempo, y se acumula **antes de avanzar el tiempo**: en la llegada `SPS = SPS + (TPLL − T) · NS` y después `T = TPLL`; en la salida `SPS = SPS + (TPS − T) · NS` y después `T = TPS`. Al final `PPS = SPS / CLL`. Con varias colas se usa la suma: `SPS = SPS + (TPLL − T) · (NS1 + NS2)`, o uno por cola: `SPS1 = SPS1 + (TPLL − T) · NS1`.
  - **Ejemplo de la clase** (3 clientes): llegan en 0, 3 y 14; salen en 8, 20 y 23. Método anterior: esperas 8 + 17 + 9 = 34 → PPS = 34/3. Método nuevo: entre eventos NS vale 1, 2, 1, 2, 1 durante 3', 5', 6', 6', 3' → 3 + 10 + 6 + 12 + 3 = 34 → mismo PPS = 34/3.
- **Tiempo comprometido (TC)**: ver sección 5. Se usa cuando el tiempo de atención se conoce desde la llegada del cliente: no hace falta modelar la salida como evento, alcanza con saber hasta cuándo está ocupado cada recurso (`TC(i)`).
