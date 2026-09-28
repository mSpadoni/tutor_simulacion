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

Convenciones de símbolos usadas en el material (para describirlos en texto, ya que el chat no dibuja):
- Óvalo: generación de variable aleatoria (a partir de una fdp).
- Hexágono/rombo alargado: obtención de número aleatorio R.
- Rectángulo: asignación/cálculo.
- Rombo: decisión (bifurcación SI/NO).
- Círculo pequeño: conector (referencias tipo "a", "1" para reconectar el diagrama).

Patrones recurrentes:
- **Tiempo Comprometido (TC)**: usado cuando un recurso, una vez que empieza a atender, ya sabe cuánto va a tardar (a diferencia de cuando el TA se conoce recién al comenzar la atención). Ejemplo remisería: cada auto que sale "compromete" un tiempo TC = T + TA; si llega una llamada antes de que se libere (T ≤ TC) el cliente espera; si T > TC hay ocio.
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

### Caso: Colas — 1 puesto, 1 cola
Datos: IA, TA. Estado: NS. Resultado: PPS, PTO.
TEI: Llegada→Llegada (EFNC) / Salida (EFC) si NS=1. Salida→Salida (EFC) si NS>0.
Fórmulas clave: `PPS = (STS-STLL)/CLL` o vía acumulador ponderado; `PTO = STO*100/T`.

### Caso: Colas — 2 puestos, 2 colas independientes
Cada puesto tiene su propia cola y su propio NS(i). El cliente entra a la cola que le corresponda según reglas del enunciado (o elige la de menor espera).

### Caso: Colas — N puestos, 1 sola cola (fila única, servidores en paralelo)
Datos: IA, TA. Control: N. Resultado: PTO(i) por cada puesto. Estado: NS (una sola cola para todos).
Regla: si NS<=N hay puesto libre inmediato; si NS>N el cliente espera en la única cola.

### Caso: Colas — N puestos, N colas (cada uno con la suya)
Estado: NS(i) por cada cola. El cliente se ubica en la cola con MENOR NS(i) (balanceo de carga).

### Caso: Colas con Prioridades (2 clases A y B)
Datos: IA, TAA, TAB (tiempo de atención según clase). Estado: NSA, NSB.
Regla: se atiende primero cualquier cliente de la cola A; solo se atiende B si NSA=0 (o la cola A está vacía). Condiciones de salida combinan NSA y NSB.

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

## 8. CÓMO GENERAR UN EJERCICIO NUEVO (para modo simulacro)

Solo ejercicios de Evento a Evento (Δt todavía no se vio). Elegir un "esqueleto" de la sección 6 (colas simples, colas con prioridad, N puestos, tiempo comprometido, transporte, mantenimiento, almacenamiento intermedio con eventos) y variar: el dominio (contexto narrativo), los tipos de f.d.p. de los datos (uniforme, lineal, exponencial), y qué se pide como resultado. Mantener siempre la consigna en el formato de las diapositivas: contexto → datos con su f.d.p. → qué se pide (a. Clasificar variables, TEI/TEF b. Diagrama de flujo, c. eventualmente resolver la generación de alguna variable aleatoria).

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
