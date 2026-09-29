# Base de conocimiento — Simulación (UTN-FRBA)

Fuentes: "Definición de variables" (Modelos y Simulación) de la cátedra, el resumen de la materia ("Resumen simulación"), las clases de la cátedra (Metodología EaE — Pasos, clase EaE 1er caso, N colas, Tiempo comprometido "Remisería", Colas con prioridades, Transporte) y la convención de diagramas acordada para el tutor. Esta base manda sobre cualquier otro material.

---

## 1. CONCEPTOS GENERALES

- **Sistema**: conjunto de reglas o elementos que ordenadamente constituyen un fin. Hay un fin, un conjunto de elementos o normas, y ese conjunto está ordenado. Sobre una misma realidad pueden definirse muchos sistemas (depende del fin y de quien la estudia).
- **Características estructurales** de un sistema:
  - **Elementos**: los componentes fundamentales; representación simplificada de alguna característica de la realidad (hay menos elementos que en la realidad).
  - **Relaciones entre los elementos**: se retienen las más significativas.
  - **Límites**: acotan el trozo de realidad que se estudia. Dentro quedan los elementos **endógenos**; fuera, los **exógenos** que actúan sobre algún elemento endógeno.
- **Modelo**: representación abstracta de cierto aspecto de la realidad, formada por elementos y relaciones. Se construye para algo. Un sistema puede representarse con muchos modelos. Tiene dos atributos en conflicto: **realismo y simplicidad** (debe ser simple pero realista). El mejor modelo es el más útil; más precisión no siempre es más útil.
- **Clasificación de modelos**: **determinísticos** (sin variables al azar; se resuelven analíticamente, investigación operativa), **estocásticos** (al menos una característica dada por una f.d.p.; ahí conviene simular), **estáticos** (no consideran el tiempo) y **dinámicos** (las interacciones varían con el tiempo). En la materia se usan modelos estocásticos y dinámicos.
- **Simulación**: generación de posibles estados del sistema por medio del modelo que lo representa, en períodos extensos y bajo condiciones estocásticas. Se usa porque ensayar sobre el sistema real puede destruirlo, es costoso, o interesa alterar la escala del tiempo. Objetivo: obtener información para tomar decisiones.
- **Escenario**: conjunto de hipótesis coherentes sobre las condiciones en que va a desenvolverse el sistema. **Imagen**: situación en que se encontrará el sistema si se da ese escenario. MODELO + escenario A → imagen A; + escenario B → imagen B.
- **Toma de decisiones**: Yi = Ri(Ui) (Ui: alternativas decisorias; Yi: resultados).
- **Etapas del proceso de simulación**: 1) formulación del problema (objetivos); 2) recolección y procesamiento de información de la realidad; 3) formulación del modelo; 4) decisiones sobre el modelo (ajustarlo); 5) decisiones sobre la realidad (basadas en el modelo).
- **Hipótesis de simplificación**: se aplican sobre los datos (pasar de la realidad al modelo). En el **diseño del experimento** se establece cómo se prueba el modelo: número de corridas, valores de las variables de control, TF, etc.
- **Siempre** trabajar el tiempo en una misma unidad (pasar todo a la misma unidad).

---

## 2. CLASIFICACIÓN DE VARIABLES (paso obligatorio del análisis previo)

De acuerdo a los límites del modelo:
- **Exógenas** (independientes, de entrada): actúan sobre el sistema pero no reciben acción de él.
  - **No controlables — Datos**: se toman de la realidad tal cual y no se pueden modificar. En general son **funciones de densidad de probabilidad** y sus valores se generan con el método de la inversa o del rechazo. Ej.: intervalo entre arribos (IA).
  - **Controlables — Variables de control**: las manipulan quienes toman decisiones o crean políticas; permiten ensayar distintos escenarios. **Son la razón por la cual se hace la simulación** y se relacionan con el resultado que se quiere obtener. Ej.: número de cajas de un supermercado. **Si el enunciado no tiene, se escribe "implícita".**
- **Endógenas** (dependientes, se generan dentro del modelo):
  - **Estado**: describen el estado del sistema en cada instante (la "foto" del sistema). Reflejan todo cambio: **cada vez que se produce un evento se modifica alguna variable de estado, y si cambia una variable de estado es porque se produjo un evento** (relación circular). Ej.: NS (cantidad en el sistema), TC (tiempo comprometido), stock.
  - **Resultado**: las de salida; se generan por la interacción de las exógenas con las de estado. **Siempre son promedios, porcentajes o algo relacionado con el tiempo** (costos): nunca "una cantidad de…". Los **costos siempre se informan en función del tiempo** (mensual, anual…). Ej.: promedio de espera en cola.
- **El tiempo (T) no se clasifica.**
- **HV (high value)**: valor alto que se le asigna a un tiempo de la T.E.F. para que ese evento no ocurra (ej. TPS = HV: puesto libre, fuerza que el próximo evento sea una llegada). TPS ≠ HV: puesto ocupado.

Formato estándar de respuesta:
```
Datos: ...
Control: ... (o "implícita")
Resultado: ...
Estado: ...
```

**Cómo deducirlas leyendo el enunciado** (razonalo en cada ejercicio; no copies las de un caso parecido):
- **Datos**: las magnitudes que varían al azar. Se reconocen porque:
  1. responden a una f.d.p. (explícita o "conocida"): "el intervalo entre arribos responde a una f.d.p. uniforme entre 5 y 15 minutos";
  2. varían según probabilidades: "el 60% de los clientes tarda 40 minutos y el resto 20" → el tiempo de atención es un dato (el dato es la magnitud que varía, no el porcentaje);
  3. salen de otro dato con una transformación: "el intervalo de los camiones grandes es el doble que el de los chicos".
  - Un porcentaje que solo decide un camino (se arrepiente o no, qué tipo de cliente es) se resuelve con un número aleatorio R dentro del evento; no se lista como dato. Tampoco un valor fijo (un costo, una capacidad).
- **Estado**: lo que cambia cuando sucede un evento. Si ningún evento la modifica, no es de estado.
- **Control**: lo que se busca decidir ("se desea determinar la cantidad N de…"). No puede ser una f.d.p.
- **Resultado**: lo que el enunciado pide obtener (casi siempre explícito).

---

## 3. CLASIFICACIÓN DE EVENTOS

- **Evento**: hecho o acontecimiento que **cambia variables de estado**. Lo que no modifica ninguna variable de estado no es un evento: es una decisión dentro de un evento (arrepentirse, elegir una cola) y va en el diagrama.
- **Evento independiente**: el que genera uno igual a sí mismo no condicionado, o ninguno; como consecuencia modifica las variables de estado. La llegada y la salida son eventos independientes entre sí.
- **"Generar un evento"** es poder decir exactamente cuándo va a suceder (ej. en una LLEGADA a las 10:00 genero IA = 12' → TPLL = 10:12).
- **La salida siempre es del puesto de atención, no de la cola** (por eso SALIDA(i)): si un puesto se desocupa, genera salidas de ESE mismo puesto.
- **La llegada ocurre después de que el cliente se distribuyó en la cola.**

### Tabla de Eventos Independientes (T.E.I.)
Una fila por evento independiente, con las columnas **EVENTO | E.F.NO C. | E.F.C.**, más la columna anexa **CONDICIÓN** (la condición para que ocurra el E.F.C.).
- **E.F.NO C.** (evento futuro no condicionado): se genera como consecuencia del evento actual sin condición. Solo puede ser **el mismo evento de la fila, o nada** ("---"). Se determina a partir de una **f.d.p., una variable de control o una constante**.
- **E.F.C.** (evento futuro condicionado): se genera por el evento actual solo si se cumple la condición.
- **CONDICIÓN**: se escribe con **variables de estado** (y, si hace falta, de control o de la T.E.F.). Nunca con datos ni resultados.

Ejemplo (1 puesto, 1 cola — clase EaE):

| EVENTO | E.F.NO C. | E.F.C. | CONDICIÓN |
|---|---|---|---|
| LLEGADA | LLEGADA | SALIDA | NS = 1 |
| SALIDA | --- | SALIDA | NS ≥ 1 |

### Tabla de Eventos Futuros (T.E.F.)
Contiene los instantes en que ocurrirán los próximos eventos: una variable de tiempo por evento (TPLL = tiempo de próxima llegada, TPS = tiempo de próxima salida, TPS(i) con N puestos).

---

## 4. GENERACIÓN DE VARIABLES ALEATORIAS

- Los intervalos **no son fijos**: se generan a partir de una f.d.p. La variable toma cualquier valor del espacio muestral S (continuo o discreto).
- **Uniforme, equiprobable y constante son lo mismo** (misma probabilidad en todos los puntos).
- **f(x)** (función de densidad): muestra la probabilidad de cada valor. **F(x)** (acumulada): creciente y continua; F(x) = ∫ₐˣ f(u) du; **F(a) = 0 y F(b) = 1** (∫ₐᵇ f(x) dx = 1). Para encontrar una f.d.p. libre de incógnitas (ej. k o la m de mx + b): integrar entre los extremos e igualar a 1.
- **R (random)**: número aleatorio entre 0 y 1 que genera la computadora.

### Método de la función inversa
Más eficiente y directo. Pasos:
1. Hallar F(x) integrando la f.d.p.: F(x) = ∫ₐˣ f(u) du (con la constante c, que se obtiene con F(a) = 0 o F(b) = 1).
2. Igualar F(x) = R (ambas varían entre 0 y 1). Si R puede dar un valor imposible (ej. 1 − R con R = 1, o 1/R con R = 0), acotarlo.
3. Despejar x = F⁻¹(R). Si hay varias inversas, tomar la positiva.
- Una parábola simple (x²) se resuelve por inversa **completando cuadrados**.
- Diagrama: hexágono con el nombre de la variable → hexágono R (random) → rectángulo **IA = F⁻¹(R)**.

### Método del rechazo
Cuando no se puede integrar fácil o no se puede despejar la inversa. Usa la f.d.p. (no la acumulada). Es iterativo.
1. Encerrar f(x) en un rectángulo de altura **M** (el máximo de f en [a, b]).
2. Generar R1 y R2.
3. **xi = a + (b − a)·R1** (barre todos los valores posibles) y **yi = M·R2**.
4. Evaluar f(xi).
5. Si **yi ≤ f(xi)** se acepta (zona de aceptación = área bajo la curva) y la variable es **xi**; si no, se rechaza y se vuelve a generar R1 y R2.
- **Eficiencia**: e = 1 / (M·(b − a)) (área bajo la curva / área del rectángulo). Cuanto más cerca M del máximo real, mejor.
- **No confundir f(xi) con f(x).**
- Diagrama: hexágono con el nombre de la variable → M = … → (vuelta del ciclo) → hexágono R1 → hexágono R2 → xi = a + (b − a)·R1 → yi = M·R2 → f(xi) = … → rombo **yi ≤ f(xi)**: NO vuelve a generar R1; SI → variable = xi.

### Cuándo usar cada método
- Función **asintótica** (hacia infinito): inversa (el rechazo no sirve: no hay M que la encierre).
- Polinómica de **grado 2**: inversa, completando cuadrados.
- Polinómica de **grado 3** (o no se puede despejar): rechazo.
- Función **partida** (por tramos): rechazo, con un rombo xi > (punto de corte) que elige qué tramo de f evaluar.

---

## 5. METODOLOGÍA EVENTO A EVENTO Y DIAGRAMAS DE FLUJO

### Los pasos de la metodología Evento a Evento (clase de la cátedra)
Es la secuencia de **cualquier** simulación Evento a Evento; con estos pasos se arma el diagrama de cualquier ejercicio:
1. **Fijación de las condiciones iniciales** del modelo (C.I.): estado inicial de las variables.
2. **Determinación del instante T del próximo evento**: se mira la T.E.F. y se busca el **menor** tiempo (ej. ¿TPLL ≤ TPS?; con N puestos, antes MENOR TPS(i)).
3. **Avance del tiempo** hasta ese instante T (T = TPLL, T = TPS(i)…).
4. **Determinación del tipo de evento** que ocurre en T.
5. **Eventos futuros NO condicionados** consecuencia del evento actual: se genera el dato y se actualiza la T.E.F. (ej. generar IA; TPLL = T + IA).
6. **Actualización del vector de estado** (ej. NS = NS + 1). Buen momento para pensar los **resultados** (acumuladores). **Si hay arrepentimiento, va antes de este paso.**
7. **Eventos futuros condicionados** consecuencia del evento actual: si se cumple la condición de la T.E.I., se genera el dato y se actualiza la T.E.F. (ej. ¿NS = 1? → generar TA; TPS = T + TA).
8. **¿Fin de la simulación?** (se compara T con TF). NO → volver al paso 2.
9. **Cálculo de resultados.**
10. **Impresión de resultados** (junto con los valores de las variables de control).

La T.E.F. alimenta los pasos 2 y 4 y la actualizan los pasos 5 y 7. Cada rutina de evento es, en orden, los pasos 3, 5, 6 y 7 de ese evento.

**Tips de la cátedra**: por la rama de la llegada se atiende solo a quien llega cuando hay un puesto vacío (atención inmediata); por la rama de la salida se atiende a quien estaba esperando en la cola.

### Cálculo de resultados (colas)
- **PTO (porcentaje de tiempo ocioso)**: STO = STO + (T − ITO); PTO = STO·100 / T. Dos formas:
  - **Cuando termina el ocio** (la recomendada): en la SALIDA, si queda vacío, guardar ITO = T **antes** de asignar TPS = HV; en la LLEGADA, si el puesto estaba libre (NS = 1), STO = STO + (T − ITO).
  - **Cuando empieza el ocio**: STO = STO + (TPLL − T) en la SALIDA; solo sirve si hay vaciamiento (si no, quedan tiempos sin calcular).
- **PPS (promedio de permanencia en el sistema)**: necesita vaciamiento. PPS = (STS − STLL) / NT (sumatoria de tiempos de salida menos sumatoria de tiempos de llegada, sobre la cantidad total). Sin vaciamiento: en la llegada SPS = SPS + (TPLL − T)·NS y en la salida SPS = SPS + (TPS − T)·NS (antes de avanzar T); PPS = SPS / NT.
- **PEC (promedio de espera en cola)**: (SPS − STA) / NT, con STA = sumatoria de tiempos de atención.
- **Vaciamiento**: al llegar a TF no se permiten más llegadas y se deja salir a todos. Después de T ≥ TF, si NS > 0, TPLL = HV y se vuelve al paso 2 (así va siempre por la rama de salida).

### Convención de diagramas (la que usa el tutor al dibujar con Kroki)
- **C.I.**: proceso predefinido (rectángulo con doble barra lateral).
- **Asignación o cálculo**: rectángulo.
- **Decisión**: rombo, sin signos de pregunta, con las ramas **SI / NO** en mayúscula.
- **Llamada a otra rutina**: hexágono con su nombre — generar una variable aleatoria (IA, TA, R), buscar un índice (MENOR TPS(i), MENOR NS(x), puesto libre, Busco menor TC(i)), un evento (LLEGADA, SALIDA), arrepentimiento, vaciamiento.
- **Impresión de resultados**: paralelogramo.
- **Fin**: círculo.
- **Conector**: círculo azul con una letra. **A** vuelve al ciclo (sale de la rama que continúa en ¿T < TF? y entra después de las C.I.); **B** es el arrepentimiento (el que se va salta a B, que entra justo antes de ¿T < TF?); los ciclos dentro de una rutina usan C, D…
- **Punto de unión**: donde se juntan varias líneas antes de entrar a un nodo; sale una sola flecha.
- El diagrama se dibuja en partes: el programa principal (C.I., próximo evento, un hexágono por evento, fin de la simulación, resultados) y una rutina por evento. **Avanzar el tiempo (T = TPLL, T = TPS) es el primer paso de la rutina de cada evento**, nunca en el programa principal.

---

## 6. CASOS DE LA CÁTEDRA (para contrastar, no para copiar)

**Cómo usar estos casos**: primero razoná el ejercicio desde el enunciado (secciones 2 y 3); después contrastá con el caso más parecido. Un ejercicio de parcial combina dos o tres casos y cambia los nombres.

### Colas — 1 puesto, 1 cola (clase EaE, 1er caso)
- Datos: IA, TA. Control: implícita. Resultado: PPS, PTO. Estado: NS.
- T.E.I.: LLEGADA | LLEGADA | SALIDA si NS = 1. SALIDA | --- | SALIDA si NS ≥ 1 (NS ya descontado). T.E.F.: TPLL, TPS.
- Diagrama: C.I. → ¿TPLL ≤ TPS? — LLEGADA: T = TPLL; IA; TPLL = T + IA; NS = NS + 1; ¿NS = 1? SI: STO = STO + (T − ITO); TA; TPS = T + TA. — SALIDA: T = TPS; NS = NS − 1; ¿NS ≥ 1? SI: TA; TPS = T + TA. NO: ITO = T; TPS = HV. → ¿T < TF? SI vuelve; NO: resultados.

### Colas — N puestos, 1 sola cola (fila única)
- Datos: IA, TA. Control: N. Resultado: PPS, PTO(i). Estado: NS.
- T.E.I.: LLEGADA | LLEGADA | SALIDA(i) si NS ≤ N (hay un puesto libre). SALIDA(i) | --- | SALIDA(i) si NS ≥ N (NS ya descontado: alguien espera y pasa a ese puesto). T.E.F.: TPLL, TPS(i).
- Diagrama: MENOR TPS(i) antes de ¿TPLL ≤ TPS(i)?; en la LLEGADA, si NS ≤ N se busca un puesto libre (TPS(x) = HV).

### Colas — N puestos, N colas (cada puesto con su fila)
- Datos: IA, TA. Control: N. Resultado: PPS, PTO(i). Estado: NS(i).
- T.E.I.: LLEGADA | LLEGADA | SALIDA(i) si NS(i) = 1. SALIDA(i) | --- | SALIDA(i) si NS(i) > 0. T.E.F.: TPLL, TPS(i).
- Diagrama: MENOR TPS(i) antes de ¿TPLL ≤ TPS(i)?; en la LLEGADA, MENOR NS(x) para elegir la fila con menos gente y NS(x) = NS(x) + 1.

### Colas con prioridades (2 colas, la A con prioridad)
- Datos: IA, TAA, TAB. Control: implícita. Resultado: PPS, PEC, PTO(i). Estado: NSA, NSB.
- T.E.I.: LLEGADA | LLEGADA | SALIDA A si NSA = 1; SALIDA B si (NSA = 2 y NSB = 0) o NSB = 1. SALIDA A | --- | SALIDA A si NSA ≥ 1. SALIDA B | --- | SALIDA B si NSA ≥ 2 o NSB ≥ 1. T.E.F.: TPLL, TPSA, TPSB.
- En la llegada se acomoda a la persona en la cola que le corresponde. En la salida se atiende y se verifica si la siguiente será de A o de B; en las condiciones se pregunta si hay que hacer el pasaje de cola (NSA = NSA − 1 y NSB = NSB + 1).

### Arrepentimiento (se agrega a cualquier caso de colas)
- No es un evento: es una decisión dentro de la LLEGADA, **antes de actualizar el vector de estado**. Se genera un único R y se compara con el porcentaje del tramo que corresponde según cuántos hay. Si se arrepiente se cuenta (CARR) y no se actualiza NS. Resultado típico: porcentaje de arrepentidos.

### Tiempo comprometido (clase "Remisería")
Se usa cuando **el tiempo de atención se conoce desde la llegada** (colas simples: se conoce cuando empieza la atención).
- Datos: IA, TA. Control: implícita (con N puestos, N). Resultado: PEC, PTO (PTO(i)). Estado: **TC** (TC1, TC2 o TC(i)).
- **Hay un único evento, la LLEGADA** (la salida queda comprometida en TC). T.E.I.: LLEGADA | LLEGADA | --- | ---. T.E.F.: TPLL.
- Diagrama: T = TPLL; IA; TPLL = T + IA; TA; ¿T ≥ TC? SI (puesto libre, atención inmediata): TC = T + TA. NO (el cliente espera): TC = TC + TA. Con 2 puestos: ¿TC1 ≤ TC2? elige el que se desocupa primero. Con N: Busco menor TC(i).
- Resultados: STO = STO + (T − TC) del lado de atención inmediata (antes de asignar TC); STE = STE + (TC − T) del lado de espera; SPS = SPS + (TC − T) abajo de ambas ramas.
- En tiempo comprometido **el arrepentimiento es por tiempo de espera**, no por cantidad de personas.

### Transporte (ejercicio 10 de la guía oficial)
- Camiones que salen de A con intervalo aleatorio, se distribuyen cíclicamente M hacia la balsa y N hacia el túnel (recursos de paso único).
- Datos: ISA (intervalo entre salidas desde A), tiempos de recorrido de cada tramo (TAB, TBC, TBE, TCD, TDC, TEF, TFG, TDG…). Control: M, N. Resultado: PTR (promedio de tiempo de recorrido). Estado: TCBa (tiempo comprometido de la balsa), TCTu (del túnel).
- **Un único evento**: la salida de A (lo demás depende de ella). El tiempo de recorrido se va sumando tramo a tramo; la balsa y el túnel son puestos de atención con tiempo comprometido (la balsa debe contar su vuelta).
- Distribución cíclica: Nc = Nc + 1; si Nc ≤ M → balsa; si no, túnel, y si Nc = M + N → Nc = 0.

---

## 7. CÓMO GUIAR, CORREGIR O RESOLVER UN EJERCICIO

Secuencia esperada del alumno (y el orden en que el tutor revisa):
1. **Metodología**: EaE o Δt (ver sección 9).
2. **Clasificación de variables** (sección 2).
3. **Eventos**: T.E.I. y T.E.F. (sección 3).
4. **Diagrama de flujo** con los pasos de la metodología (sección 5).
5. **Generación de variables aleatorias** si el enunciado da una f.d.p. para resolver (sección 4).

Al corregir: señalar en qué paso está el error (no solo "está mal") y contrastar con el caso más parecido de la sección 6.

### Cómo resolver un ejercicio desde cero (sin un caso parecido)
1. Datos, control y resultados desde el enunciado (sección 2).
2. Estado: qué describe cómo está el sistema en cada momento.
3. Eventos: qué hechos modifican esas variables de estado.
4. T.E.F.: una variable de tiempo por evento.
5. T.E.I., evento por evento: ¿con un dato puedo decir cuándo vuelve a pasar este mismo evento, sin condición? → E.F.NO C. ¿Qué otros eventos puedo programar desde este y bajo qué condición sobre el estado? → E.F.C. con su condición.
6. Diagrama con los pasos de la sección 5.
7. Contrastar con el caso más parecido de la sección 6.

---

## 8. CÓMO GENERAR UN EJERCICIO NUEVO

**Qué sistemas.** Por ahora solo sistemas que se resuelven con Evento a Evento. **El enunciado nunca dice la metodología**: elegirla es parte de lo que resuelve el alumno.

**De dónde sale.** El tipo de ejercicio es el de la Guía Anexa, los parciales y la guía oficial del 9 al 12. Son **inspiración**: el ejercicio nuevo se crea desde cero (otro dominio, título, historia y datos), combinando el tipo de sistema y las complicaciones de la inspiración con los casos de la sección 6. Nunca se devuelve uno de la cátedra tal cual ni cambiando solo los números. Los modelos de la guía oficial (1 a 8) no se dan como ejercicio.

**Cómo se redacta** (como la Guía Anexa y los parciales):
- Un título corto con el dominio.
- El sistema contado en prosa, con palabras del dominio y sin vocabulario de la materia.
- Los **datos**, de alguna de estas formas: responden a una f.d.p. explícita en el estilo de la cátedra ("equiprobable entre 10 y 35 minutos", "lineal donde f(20) = 2·f(10)", "entre 2 y 8 horas con f(x) = (x − 1)/24"); responden a una f.d.p. conocida; salen de otro dato ("el doble que…"); o toman distintos valores según probabilidades ("el 60% tarda 40 minutos y el resto 20"). **Sin nombrar la variable** (ni siglas): qué variable es cada dato lo deduce el alumno. Nunca "distribución" ni "f(x)" suelta.
- Porcentajes y reglas del dominio que generan las complicaciones.
- Qué se busca decidir (sin llamarlo variable de control) y qué se quiere medir: "Se desea determinar la cantidad N de …; para ello se estudiará …".
- La consigna: "Se pide: a) Análisis completo: Metodología, clasificación de variables, tabla de eventos independientes, tabla de eventos futuros. b) Diagrama de flujo. c) Resolver las f.d.p. por el método más conveniente."

**Complejidad de parcial**: dos o tres complicaciones combinadas; varios datos, al menos uno con una f.d.p. no uniforme para resolver; una decisión y dos o tres resultados; el largo de la anexa (unos 1100 caracteres).

**Coherencia del sistema** (un enunciado incoherente no se puede resolver):
- La estructura queda fija durante toda la corrida (la cantidad de puestos no cambia a mitad de la simulación); lo que se decide es una variable de control.
- Cada f.d.p. se puede resolver con lo que dice el enunciado (una lineal necesita su recta; una exponencial, su media).
- Las reglas no se pisan ni dejan huecos (los tramos de arrepentimiento cubren todos los casos sin superponerse).
- Cada complicación se modela con lo que vio la cátedra (sección 6).
- Los resultados son promedios, porcentajes o costos por unidad de tiempo, nombrados con precisión.

**Qué no va nunca en el enunciado**: la metodología ("evento a evento", "EaE", "Δt"), nombres de eventos o variables (TPLL, TPS, NS, TC, TEF, TEI), la clasificación de variables, ni pistas de cómo se resuelve.

---

## 9. CONCEPTOS QUE SE TOMAN EN LOS PARCIALITOS

### Elección de metodología: Evento a Evento o Δt constante
- **EaE**: hay un dato que permite **concatenar eventos en el tiempo**, en intervalos variables. Se puede determinar exactamente en qué momento sucede cada evento (el instante del evento es el instante en que cambia la variable de estado).
- **Δt constante**: hay uno o más datos dados en **densidades** ("cantidad de …, en un cierto tiempo"); no se sabe en qué momento del Δt ocurrió cada cosa. Se avanza de a Δt, pase o no pase algo.
- Si se pueden aplicar ambas, se elige la más eficiente: si el Δt es muy chico respecto del problema, o hay muchos Δt en los que no pasa nada y se puede asignar cuándo ocurre cada evento, conviene EaE.
- **Colas simples vs. tiempo comprometido**: depende de cuándo se materializa el tiempo de atención (cuando empieza la atención → colas simples; desde la llegada → tiempo comprometido).

### Plantear nuevas variables de control
- Decir por qué se elige y cómo influiría en los resultados (justificar).
- Una f.d.p. no puede convertirse en variable de control.
- No debe cambiar el objetivo de la simulación: tiene que beneficiarlo.
- Se pueden convertir comportamientos o valores constantes en variables de control (ej. en stock: agregar tamaño de pedido o stock de reposición si no están, agregar proveedores o puntos de venta).

### Cantidad de simulaciones (en Δt)
- Se determina según cuántas f.d.p. distintas valen para el mismo dato en distintos períodos largos (ej. una f.d.p. por cuatrimestre → una simulación por cuatrimestre).
- Si el resultado que se quiere es el mismo para todos los días, es una sola simulación aunque cambie la f.d.p. (se pregunta qué día es y se cambia el comportamiento).
- **Perturbación puntual**: si ya se sabe qué va a pasar y cómo afecta, no se modela (está contenida en la f.d.p. o se maneja por fuera del modelo).

### Δt constante (se ve más adelante en la materia)
Clasificación de eventos en Δt: **eventos propios** (modifican el estado y ocurren en el Δt actual), **eventos que se comprometen para Δt futuros** (los únicos que afectan la T.E.F.; pueden no modificar el estado) y **eventos comprometidos en Δt anteriores** (ocurren por una acción del pasado, cuando lo indica la T.E.F.). Orden: comprometidos en Δt anteriores → propios → que se comprometen para Δt futuros. Hoy los ejercicios y correcciones son solo de Evento a Evento.
