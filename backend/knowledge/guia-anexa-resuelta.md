# Guía Anexa resuelta (ejercicios de la cátedra, 2013 y 2015)

Fuente: "Guía Anexa (Resuelta)". Resoluciones de referencia del análisis previo (variables, T.E.I. y T.E.F.).
Los diagramas de flujo de este documento eran imágenes y no están incluidos.
En la T.E.I., la columna TEF indica la variable de tiempo de cada evento.


## Colas (NS) — Metodología EaE

### Sistema de gestión de expedientes

Los interesados presentan cada expediente ante la oficina de Mesa de Entradas, que lo recibe y lo deriva a la empleada 1 o a la empleada 2, según la menor cantidad de expedientes pendientes que tengan y en caso de igualdad se lo entrega en forma aleatoria con un 80 % a la empleada 1 y un 20 % a la empleada 2.
Los interesados se presentan con un expediente con intervalo de llegada entre 1 y 3 horas que corresponde a una función de densidad de probabilidad de tipo f(x)= 2 x2 + 1. El tiempo que se tarda en gestionar un expediente puede variar entre 1 y 4 horas respondiendo a una función de densidad de probabilidad, teniendo en cuenta que la empleada 2 tarda siempre media hora más que la empleada 1.
Los expedientes son rechazados solo cuando las empleadas llegan al máximo de pendientes que es de 100 para la empleada 1 y de 80 para la empleada 2. Obtener los siguientes resultados: promedio de espera de los expedientes, porcentaje de tiempo ocioso de cada empleada, porcentaje de expedientes rechazados respecto al total, Porcentaje de expediente atendidos por la empleada 2 respecto a la empleada 1.

- **Datos:** IE (Intervalo entre expedientes), TGE (Tiempo de gestión de expediente)
- **Control:** Implícita
- **Resultado:** PEE, PTO1, PTO2, PR, PE2P1 — Promedio de espera de expedientes / Porcentaje de tiempo ocioso de empleada 1 / Porcentaje de tiempo ocioso de empleada 2 / Porcentaje de rechazados / total / Porcentaje de expedientes E2 / E1
- **Estado:** EE1 (Expedientes empleada 1), EE2 (Expedientes empleada 2)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPLL | llegada | llegada | salida1 | EE1 = 1 |
|   |   |   | salida2 | EE2 = 1 |
| TPS1 | salida1 | - | salida1 | EE1 > 0 |
| TPS2 | salida2 | - | salida2 | EE2 > 0 |

### Aduana de aeropuerto k35/5

En un aeropuerto internacional, se desea optimizar la atención en la zona de aduana de los pasajeros que arriban al país provenientes del extranjero, con el propósito de minimizar el tiempo de la misma, como así también el promedio de tiempo ocioso de cada policía de aduana. Los pasajeros deben pasar por uno de los N puestos de atención de aduana, cada uno con su correspondiente cola.
El intervalo de pasajeros que llegan a los puestos responde a una función de densidad de probabilidad (la cual toma en cuenta los picos de arribos que se producen con la llegada de los vuelos).
Cada pasajero que llega se ubica en la cola con menor cantidad de gente. Se estima que la revisión y chequeo del equipaje del pasajero se produce en un 40% de las veces, mientras que el resto de las veces pasan sin control. De producirse esta operación el tiempo que ella insume está dada por una f.d.p conocida.

- **Datos:** IP (Intervalo entre pasajeros), TRE (Tiempo de revisión de equipaje)
- **Control:** N (Puestos)
- **Resultado:** STA (Sumatoria de tiempo de atención), PTO[N] (Porcentaje de tiempo ocioso de puesto N)
- **Estado:** NS[N] (Personas en cola de puesto N)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPLL | llegada | llegada | salida[N] | NS[N] = 1 |
| TPS[N] | salida[N] | - | salida[N] | NS[N] > 0 |

### Aduana de aeropuerto k35/10

En un aeropuerto internacional, se desea conocer el promedio de permanencia en el sistema en la zona de aduana para los pasajeros que arriban al país provenientes del extranjero. Aquellos que no declaran en aduana, si es que compraron elementos de elevado valor, deben pasar por N puestos de atención de aduana, cada uno con su correspondiente cola.
El intervalo de pasajeros que llegan a los puestos responde a una función de densidad de probabilidad (la cual toma en cuenta los picos de arribos que se producen con la llegada de los vuelos).
Cada pasajero que llega se ubica en la cola con menor cantidad de gente. Se estima que la revisión y chequeo del equipaje del pasajero se produce en un 40% de las veces. De producirse esta operación el tiempo que ella insume está dada por una f.d.p conocida.
Con el propósito de minimizar el tiempo de la misma, como así también el promedio de tiempo ocioso de cada policía de aduana, se realizará una simulación.

- **Datos:** IP (Intervalo entre pasajeros), TRE (Tiempo de revisión de equipaje)
- **Control:** N (Puestos)
- **Resultado:** PPS (Promedio de permanencia en el sistema), PTO[N] (Porcentaje de tiempo ocioso de puesto N)
- **Estado:** NS[N] (Personas en cola de puesto N)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPLL | llegada | llegada | salida[N] | NS[N] = 1 |
| TPS[N] | salida[N] | - | salida[N] | NS[N] > 0 |

### Gatos y perros

En una veterinaria hay N veterinarios especialistas en Gatos y M especialistas en Perros. Cuando llega un Gato con su dueño a atenderse, es derivado al primer especialista que esté desocupado, o de lo contrario tendrá que esperar en la sala de espera: Lo mismo sucede con los perros. El problema es que la sala de espera es la misma para ambos; entonces cuando llega un gato, si hay un perro esperando, debe retirarse. Lo mismo sucede cuando llega un perro, si ya hay un gato esperando anteriormente, el perro deberá retirarse.
Se conoce la f.d.p del intervalo entre arribos de los animales (el 60% son perros y el 40% gatos) que responde a f(x) = λ e -λ x para x ≥ 0. También se conoce la f.d.p del Tiempo de atención de cada consulta, conocido recién cuando el animal comienza a atenderse. Se desea saber cuál debe ser la cantidad de especialistas veterinarios en gatos y perros (N y M) que permitirá atender a la mayor cantidad de animales, para ello se deberá obtener el porcentaje de gatos y perros que se fueron, respecto de los que ingresaron a la veterinaria, así como el tiempo ocioso de cada puesto.

- **Datos:** IA (Intervalo entre animales), TAA (Tiempo de atención del animal)
- **Control:** N (Especialistas en gatos), M (Especialistas en perros)
- **Resultado:** PGFRI (Porcentaje de gatos que se fueron/ingresaron), PPFRI (Porcentaje de perros que se fueron/ingresaron), PTO[N] (Porcentaje de tiempo ocioso de puesto N), PTO[M] (Porcentaje de tiempo ocioso de puesto M)
- **Estado:** G (Gatos), P (Perros)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPLL | llegada | llegada | salidaG[N] | G ≤ N |
|   |   |   | salidaP[M] | P ≤ M |
| TPSG[N] | salidaG[N] | - | salidaG[N] | G ≥ N |
| TPSP[M] | salidaP[M] | - | salidaP[M] | P ≥ M |

### Clínica

Una clínica tiene en su sala de guardia dos consultorios para la atención de pacientes. Estos llegan según una frecuencia dada por una f.d.p, conocida. Luego de tomar los datos del paciente, la secretaria consulta sus registros, y le asigna el médico con menor cantidad de personas en espera. El tiempo de atención de cada uno se podrá estimar en el momento que comience a ser atendido y corresponde a una f.d.p. dada en minutos. Cuando se presenta un caso caratulado de emergencia, cualquiera de los médicos puede ser asignado a este caso, por lo que empezaría a atenderla una vez que sale el paciente en curso. Esto puede suceder al 30% de los pacientes y su atención demora entre 20 a 35 minutos según una f.d.p. A los efectos de evaluar la eficiencia en la atención de los pacientes, se desea conocer el porcentaje de tiempo ocioso de cada médico, el promedio de permanencia en el sistema de los pacientes y el promedio total de atención en los casos de emergencia.

- **Datos:** IP (Intervalo entre pacientes), TAC (Tiempo de atención común), TAE (Tiempo de atención emergencia)
- **Control:** M (Médicos)
- **Resultado:** PTO[M], PPS, PTAE — Porcentaje de tiempo ocioso de médico M / Promedio de permanencia en el sistema / Promedio de tiempo de atención de emergencia (STAE / PE)
- **Estado:** P[M] (Pacientes médico M)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPLL | llegada | llegada | salida[M] | P[M] = 1 |
| TPSP[M] | salida[M] | - | salida[M] | P[M] > 0 |

### Super coreano

Un supermercado analiza la posibilidad de contratar una nueva cajera. El coreano, dueño del supermercado, cuenta actualmente con una sola cajera. Los clientes llegan a la caja con una frecuencia que responde a una función de densidad de probabilidad (f.d.p) equiprobable entre O y 2 minutos. Cuando hay más de 5 personas en la fila, el coreano se decide a ayudar a la cajera, y empieza a atender en otra caja. Cuando la cantidad de personas en la cola es de 5 o menos, deja de ayudarla. El tiempo de atención de los clientes se conoce recién cuando comienza a ser atendido y responde a una f.d.p de tipo f(x) = [1-(X-1)2]/k.
Aquellas personas que al llegar encuentran hasta 5 personas en la cola se quedan, si encuentran hasta 8 personas se queda solamente el 60% y más de 8 el 40%.
Se desea conocer el porcentaje de tiempo ocioso de la cajera y el porcentaje de tiempo que trabajo el coreano, para ver si necesita o no contratar a otra cajera.

- **Datos:** IC (Intervalo entre clientes), TAC (Tiempo de atención de clientes)
- **Control:** —
- **Resultado:** PTOK, PTC — Porcentaje de tiempo ocioso de cajera / Porcentaje de trabajo del coreano (STACC / STAC)
- **Estado:** NS (Clientes en cola)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPLL | llegada | llegada | salidaK | (NS = 1) ˅ (NS = 2 ^ TPSC <> HV) |
|   |   |   | salidaC | NS = 6 ^ TPSC = HV |
| TPSK | salidaK | - | salidaK | (NS ≥ 2 ) ˅ (NS = 1 ^ TPSC = HV) |
| TPSC | salidaC | - | salidaC | NS ≥ 6 |

### Cabinas de peaje

Una empresa de autopistas desea determinar el número óptimo de cabinas de peaje a habilitar durante los cambios de quincena de la temporada de verano. Se sabe que los autos llegan al puesto de peaje con una frecuencia determinada por una f.d.p. y se ubican en la cola con menor cantidad de autos. El tiempo de atención se determina cuando el auto llega a la cabina y depende entre otras cosas del modo de pago (exacta, cambio, prepago). Se cuenta además con una legislación vigente que estipula que cuando en la cola hay más de 10 autos las barreras deben levantarse sin recibir pago alguno, hasta que la misma quede vacía. El tiempo que tarda cada auto en cruzar la barrera sin pagar es en promedio 1 minuto. Se desea determinar el Porcentaje de Autos que pasaron sin pagar, Porcentaje de tiempo Ocioso de las cabinas y Promedio de Permanencia en el sistema

- **Datos:** IA (Intervalo entre autos), TAPE (Tiempo de atención pago exacto), TAPCC (Tiempo de atención pago con cambio), TAP (Tiempo de atención prepago)
- **Control:** C (Cabinas)
- **Resultado:** PAPSP (Porcentaje de Autos que pasaron sin pagar), PTO[i] (Porcentaje de tiempo Ocioso de las cabinas), PPS (Promedio de Permanencia en el sistema)
- **Estado:** NS[i] (Clientes en cada cola)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPLL | Llegada | Llegada | Salida [i] | NS [i] = 1 |
| TPS[i] | Salida [i] | - | Salida [i] | NS [i] > 0 |

### Doctor House

En un hospital se encuentra un famoso médico, quien con su grupo de ayudantes resuelve diferentes casos. Los casos a resolver se reciben en la administración del hospital, en donde es analizada la severidad y son atendidos ó derivados a otro hospital según corresponda.
El 85% de los casos son de baja severidad, los cuales son atendidos por uno de los integrantes del grupo de médicos ayudantes que se encuentre libre ó el primero en desocuparse. El 15% restante, “casos de alta complejidad”, son atendidos personalmente por el famoso médico, siempre que esté libre, caso contrario son derivados a otro hospital.
Tanto la frecuencia con la que se reciben los casos, como el tiempo en que uno de los médicos ayudantes demora en la resolución del caso, están determinados por una fdp. El tiempo que tarda el famoso medico en resolver los casos que le son asignados responde a otra fdp, conocida cuando el paciente es atendido.
Se pide: 1) Porcentaje de casos (pacientes) que son derivados a otro hospital.
2) Promedio de permanencia en el sistema.
3) Porcentaje de tiempo ocioso de los médicos ayudantes.
Estos dos últimos resultados permitirán analizar si es necesario ampliar la cantidad de ayudantes.

- **Datos:** IP (Intervalo entre pacientes), TAC (Tiempo de atención común), TAMF (Tiempo de atención médico famoso)
- **Control:** M (Médicos)
- **Resultado:** PD (Porcentaje de derivados), PPS (Promedio de permanencia en el sistema), PTO[M] (Porcentaje de tiempo ocioso de los ayudantes)
- **Estado:** P (Pacientes), TPSMF (Tiempo de salida de un atendido por el médico famoso)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPLL | llegada | llegada | salidaC[M] | NS ≤ M |
|   |   |   | salidaMF | TPSMF = HV |
| TPSC[M] | salidaC[M] | - | salidaC[M] | NS ≥ M |
| TPSMF | salidaMF | - | - | - |

### Colonia de Hormigas

En una colonia de hormigas existen dos tipos de hormigas, las hormigas recolectoras que recogen hojas y ramitas en las cercanías del hormiguero, y las cortadoras de hojas ubicadas en las copas de los árboles.
Lo que cortan este último tipo de hormigas cae al suelo para ser recolectado por el otro tipo de hormigas.
La reina de la colonia desea correr una simulación que le indique el tiempo promedio que permanecen las hojas y ramitas en el suelo para cada n (cantidad de hormigas recolectoras).
Se sabe que el 70% de lo que cortan las hormigas en los árboles son hojas y el 30% restante son ramitas. Dependiendo de si son hojas o ramitas, el tiempo de traslado al hormiguero y la vuelta son diferentes:
- Hojas: f.d.p. equiprobable de 1 a 5 minutos (TR1)
- Ramitas: f.d.p. equiprobable de 3 a 7 minutos (TR2)
Las hojas y ramitas caen al suelo con intervalos aleatorios que responden a una f.d.p. lineal entre 1/6 y 1 minuto donde f(1/6) = 3 f(1) (IC)

- **Datos:** IEC (Intervalo entre caídas), TR1 (Traslado por hojas), TR2 (Traslado por ramitas)
- **Control:** N (Hormigas recolectoras)
- **Resultado:** PRHS (Promedio de ramitas y hojas en suelo)
- **Estado:** RH (Ramitas y hojas)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPC | caída | caída | recolección[N] | RH ≤ N |
| TPR[N] | recolección[N] | - | recolección[N] | RH ≥ N |

### Campo deportivo

El acceso al campo deportivo de un club social se realiza por la entrada principal del predio donde se encuentra el puesto de control.
El 70 % de los que Ingresan son socios de la entidad. A todo no socio que desee hacer uso de las instalaciones se le solicita abone el cupón correspondiente, o bien opte por hacerse socio.
El 60 % de los no socios abona el cupón, en cambio el resto prefiere asociarse en el momento.
Se conoce el intervalo de tiempo entre llegadas (lA) y los tiempos de atención (f.d.p. equiprobable) para cada trámite:

| ATENCION A UN SOCIO | entre 3 y 6 minutos |
|---|---|
| ENTREGA DE CUPÓN A UN NO SOCIO | entre 10 y 15 minutos |
| INGRESO DE NUEVO SOCIO | entre 15 y 20 minutos |

El club ha realizado una encuesta entre los concurrentes al predio, y los resultados indican que gran parte de los socios con antigüedad señala,que los tiempos de ingreso han aumentado, desde que el mismo puesto de atención atiende tanto a los socios como a los no socios. Para mejorar esto se requiere calcular el promedio de espera en cola.

- **Datos:** IA (Intervalo entre arribos), TAS (Tiempo atención a un socio), TECNS (Tiempo entrega de cupón a un no socio), TINS (Tiempo ingreso de nuevo socio)
- **Control:** —
- **Resultado:** PEC (Promedio de espera en cola)
- **Estado:** NS

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPLL | llegada | llegada | salida | NS = 1 |
| TPS | salida | - | salida | NS > 0 |

### Vuelta al Mundo

Una vuelta al mundo tiene ocho (8) asientos. Las personas van llegando al juego con una frecuencia que responde a una fdp uniforme entre 1 y 5 minutos. Se trata de llenar todos los asientos pero si hay 4 personas el juego arranca igual. El tiempo del juego responde a otra fdp y el tiempo de vaciamiento de la rueda depende de la cantidad de personas en los asientos por lo tanto el mismo responde a distintas fdp de acuerdo a la cantidad de personas a bajar. Todas las personas se quedan si encuentran hasta 20 personas en la cola y solo el 30% si encuentra más.
El dueño del juego quiere conocer la cantidad de veces que el juego no salió completo y las veces que cuando el juego arrancó se quedaron personas esperando para decidir si cambia el carrito actual por uno más grande o más chico.

- **Datos:** IA (Intervalo entre arribos), TJ (Tiempo de juego), TVJ4P (Tiempo de vaciamiento del juego 4P), TVJ5P (Tiempo de vaciamiento del juego 5P), TVJ6P (Tiempo de vaciamiento del juego 6P), TVJ7P (Tiempo de vaciamiento del juego 7P), TVJ8P (Tiempo de vaciamiento del juego 8P)
- **Control:** —
- **Resultado:** VJI (Veces de juego incompleto), ACC (Arrepentidos por cambio de carrito)
- **Estado:** NS (Personas en cola)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPLL | llegada | llegada | salida | NS ≥ 4 ^ TPS = HV |
| TPS | salida | - | salida | NS > 4 |

### Atila e Isidoro

Se cuenta con dos servidores (Atila e Isidoro) de base de datos encargados de gestionar las consultas de los usuarios. Para ello se cuenta con una estructura en la cual:
Los pedidos llegan al sistema con una frecuencia dada por una fdp y son tomados por un módulo distribuidor, el cual reparte (en un tiempo despreciable) los pedidos en forma cíclica hacia los servidores. Para evitar sabotajes, existe una política de seguridad que limita la cantidad de pedidos en espera a 40, si se supera esa cantidad el pedido se descarta.
El servidor Atila es antiguo, por lo cual solo atiende una consulta a la vez. Su tiempo de procesamiento esta dado por una fdp del tipo f(x) = [4-(x-4)2]/k. Isidoro es mucho más moderno y procesa los pedidos de a pares. Su tiempo de procesamiento corresponde a una fdp 30 % menor a la de Atila.
Luego el módulo de respuesta toma los pedidos ya procesados y los retoma al usuario en un tiempo despreciable.
Se busca la mejor distribución de pedidos entre los servidores con el objetivo de minimizar la cantidad de rechazos y el tiempo de respuesta.

- **Datos:** IP (Intervalo entre pedidos), TAA (Tiempo de procesamiento Atila), TAI (Tiempo de procesamiento Isidoro)
- **Control:** I (Pedidos para Isidoro), A (Pedidos para Atila)
- **Resultado:** CR (Cantidad de rechazos), TR (Tiempo de respuesta)
- **Estado:** P (Pedidos)

Una cola que atiende a 2 juntos?

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPLL | Llegada | Llegada | SalidaI | (P = 3) and (TPSA <> HV) |
|   |   |   | SalidaA | P = 1 or (TPSI <>HV ^ P = 3) |
| TPSI | SalidaI | --- | SalidaI | P ≥ 3 |
| TPSA | SalidaA | --- | SalidaA | P = 1 o P > 3 |

O con 2 colas?

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPLL | Llegada | Llegada | SalidaI | NSI = 2 |
|   |   |   | SalidaA | NSA = 1 |
| TPSI | SalidaI | --- | SalidaI | NSI > 1 |
| TPSA | SalidaA | --- | SalidaA | NSA > 1 |

### Fotocopiadoras

Se desea instalar un local para sacar fotocopias. Se sabe que la llegada de las personas dada en minutos responde a una función de densidad de probabilidad (lA) lineal variando entre 1 a 5 minutos, tal que f(5) = 2 * f(1).
La cantidad de copias a sacar (CANTC) también responde a una f.d.p. Si la cantidad de copias a sacar es mayor a 60, entonces las fotocopias no se sacan en el momento sino que se dejan encargadas para el día siguiente.
El tiempo de atención se conoce recién cuando la persona es atendida y corresponde a la cantidad de copias por un tiempo estimado de 15 segundos por copia. Si las copias se encargan, se completa un formulario indicando nombre, hojas a fotocopiar y cantidad de copias; todo ello insume un tiempo que responde a otra f.d.p, (TAE) equiprobable con x variando entre 0.5 y 1.5 minutos.
El 80% de las personas si encuentran entre 2 y 5 personas en la cola, esperan a ser atendidas; si hay hasta 10 personas el 85% se retira.
Se debe tener en cuenta que los trabajos encargados se realizan en los momentos en que no hay personas para atender y en caso de no alcanzar se deberán hacer en horas extras. Además los mismos se pueden ir realizando parcialmente.
Se desea saber qué cantidad de fotocopiadoras se deben comprar (N) de manera que se minimice el porcentaje de tiempo ocioso, el porcentaje de personas arrepentidas, el promedio de espera en cola y las horas extras.

- **Datos:** IA (Intervalo entre arribos), CANTC (Copias a sacar), TAE (Tiempo de formulario)
- **Control:** F (Fotocopiadoras)
- **Resultado:** PTO[N] (Porcentaje de tiempo ocioso de fotocopiadoras), PARREP (Porcentaje de personas arrepentidas), PEC (Promedio de espera en cola), HE (Horas extras)
- **Estado:** NS (Clientes)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPLL | llegadaCliente | llegadaCliente | salidaCliente | NS ≤ F |
| TPS | salidaCliente | - | salidaCliente | NS ≥ F |

### Droguería

Una droguería está analizando la posibilidad de producir y distribuir un nuevo medicamento preparado por ellos. Este medicamento debe prepararse en el momento en que el cliente hace el pedido, ya que el plazo de vida del medicamento es muy corto. Para ello se necesitará contratar una cantidad N de farmacéuticos, considerando que se debe satisfacer a los clientes que hagan pedidos y que el presupuesto para pagar a los farmacéuticos debe ser el menor posible.
Según un estudio realizado, se determinó las f.d.p. del intervalo entre arribos (lA) de los clientes y del tiempo que utiliza el farmacéutico en la preparación del pedido (TPP) (el cual se conoce al tomar el pedido). Para la distribución de los medicamentos, se deben adquirir una cantidad de camionetas M, cada una podrá salir con los pedidos una vez que se acumulen Q pedidos listos para ser entregados. Se conoce el tiempo de entrega del pedido (TEP) y el tiempo de regreso de la camioneta luego de entregar el pedido (TR), ambas fdp. Se pide el promedio de espera del cliente desde que efectúa el pedido hasta que lo recibe.

- **Datos:** IA (Intervalo entre arribos), TPP (Tiempo de preparación), TEP (Tiempo de entrega del pedido), TR (Tiempo de regreso de la camioneta)
- **Control:** N (Farmacéuticos), M (Camionetas), Q (Pedidos listos)
- **Resultado:** PEC (Promedio de espera del cliente)
- **Estado:** NS (Clientes), P (Pedidos)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPLL | Llegada | Llegada | Preparación[N] | NS ≤ N |
| TPP[N] | Preparación[N] | - | Preparación[N] | NS ≥ N |
|   |   |   | Envío[j] | P ≥ Q ^ TPE[M] = HV |
| TPE[M] | Envío[j] | - | Envío[j] | P ≥ Q |

### Redes

Se cuenta con un Bridge -Puente- para interconectar dos tipos de redes distintas. El dispositivo cuenta con un buffer central en el que cada paquete que llega (sin importar el origen) espera ser atendido por el procesador: analizado, traducido y retransmitido.
Hay un 65 % de probabilidades de que llegue un paquete 802.3 Ethernet y su longitud promedio es de 1500 Bytes. En cambio los paquetes 802.5 Token Ring tienen un 35% de probabilidad y su longitud promedio es de 4500 Bytes.
Si el paquete es del tipo 802.3, el tiempo que tarda en ser procesado (análisis, traducción y retransmisión) está dado por una fdp equiprobable entre 5 y 30 ms (TA.802.3); si es del tipo 802.5 el tiempo está dado por una fdp equiprobable entre 2 y 32 ms (TA.802.3). El intervalo entre arribos de paquetes está dado por una fdp lineal entre 15 y 35 ms (lA), tal que f(35)=2*f (15).
Se desea saber el tamaño mínimo del buffer (16KB, 32KB, 64KB, 128KB, 256KB, 512KB) que minimice el porcentaje de paquetes perdidos y además minimice el promedio de espera de los paquetes desde que ingresan hasta que salen.

- **Datos:** TP8023 (Tiempo de procesamiento 802.3), TP8025 (Tiempo de procesamiento 802.5), IA (Intervalo entre arribos)
- **Control:** TB (Tamaño del buffer)
- **Resultado:** PPP (Porcentaje de paquetes perdidos), PEP (Promedio espera de paquetes)
- **Estado:** NS

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPLL | llegadaPaquete | llegadaPaquete | salidaPaquete | NS = 1 |
| TPS | salidaPaquete | - | salidaPaquete | NS > 0 |

### Servidor de correo electrónico

Un servidor de correo electrónico funciona con 20 procesadores, cada uno de los cuales está encargado de procesar los mensajes en espera, que se encuentran en una cola asociada a cada procesador.
Los mensajes llegan al servidor con una frecuencia correspondiente a: f(x)=3/2 (-x2 +6x-5)
Los mensajes se clasifican de acuerdo a su prioridad en:
Mensajes de Prioridad Alta (A)
Mensajes de Prioridad Normal (N)
Mensajes de Prioridad Baja (B)
El 50 % de los mensajes que llegan al servidor son de tipo B, el 35 % son de tipo N y solo el 15 % corresponden a mensajes de Prioridad Alta.
De acuerdo a su prioridad, el módulo de despacho los direcciona a una cola de tipo A, N o B eligiendo del subconjunto correspondiente, la más próxima a vaciarse. Los mensajes de Prioridad Alta, se encolan siempre. Los de prioridad Normal, son rechazados, si la espera es mayor a 45 minutos. Los de Prioridad Baja, son rechazados si la espera supera los 15 minutos.
El tiempo de procesamiento de cada mensaje es proporcional al tamaño del mensaje, y es determinado por el módulo de despacho, que se encuentra en la entrada del sistema. Los tamaños de cada tipo de mensaje varían, y se corresponden con fdp equiprobables, dentro de los siguientes intervalos:
Tamaño de Mensajes A: entre 10 y 50 kb
Tamaño de Mensajes N: entre 75 y 150 kb
Tamaño de Mensajes B: entre. 100 y 500 kb
Se debe determinar el tiempo promedio de espera en cola de cada mensaje, según su tipo, y el porcentaje de tiempo ocioso para cada tipo de cola.

- **Datos:** IAM (Intervalo entre arribos de mensajes), TMA (Tamaño mensaje A), TMN (Tamaño mensaje N), TMB (Tamaño mensaje B)
- **Control:** NA (Procesadores tipo A), NN (Procesadores tipo N), NB (Procesadores tipo B)
- **Resultado:** PECMA, PECMN, PECMB, PTOA, PTON, PTOB
- **Estado:** TCA[i], TCN[j], TCB[k]

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPLLM | llegadaMensaje | llegadaMensaje | - | - |

### Código Rojo

Una empresa de emergencias médicas necesita saber cuál es la cantidad ideal de ambulancias y vehículos de visitas que debe contratar para disminuir los tiempos de espera.
La empresa, al recibir una llamada solicitando atención médica, clasifica el servicio en base a los síntomas descritos por el cliente. Las clasificaciones posibles son:
Código Rojo, si hay riesgo de vida
Código Amarillo, si los síntomas son de gravedad pero no presenta riesgo de vida
Código Verde, para una visita médica
La frecuencia con la que se reciben llamados de cada categoría, responde a una fdp conocida, expresada en minutos. Se sabe que por cada llamada hay una probabilidad del 12% de que sea una emergencia de código rojo, 21% de que sea una de código amarillo y 67% de que sea una de código verde. Para atender estos servicios, la empresa cuenta con N ambulancias, encargadas de atender los códigos rojo y amarillo, y con M vehículos para atender códigos verdes. El tiempo que tarda cada unidad en atender un servicio está dado por una fdp para cada uno, expresada en minutos.
Existen tres colas, una por cada tipo de emergencia. Las ambulancias atienden las colas de código rojo y las de código amarillo, y los vehículos la de códigos verdes. Si cuando se recibe el llamado hay alguna ambulancia/vehículo libre, se lo asigna al mismo. En cambio, si están todos ocupados, queda en la cola de espera hasta que uno se libere.
Se debe tener en cuenta que la cola de códigos rojo tiene mayor prioridad que la de amarillos, por lo que cuando ambas contienen emergencias pendientes, primero se asignan las de código rojo. Aunque las de código amarillo hayan llegado antes, sólo se asignarán a ambulancias cuando no haya emergencias pendientes en la otra cola.

- **Datos:** IA (Intervalo entre llamados), TAR (Tiempo de atención rojo), TAA (Tiempo de atención amarillo), TAV (Tiempo de atención verde)
- **Control:** N (Ambulancias), M (Vehículos)
- **Resultado:** PECA (Promedio de espera en cola ambulancia), PECV (Promedio de espera en cola vehículo)
- **Estado:** NSER (Cola emergencia roja), NSEA (Cola emergencia amarilla), NSCRA (Cola común rojo y amarillo), NSV (Cola verde)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPLL | llegadaLL | llegadaLL | salidaA[i] | NSER + NSEA + NSCRA ≤ N |
|   |   |   | salidaV[j] | NSV ≤ M |
| TPS[i] | salidaA[i] | - | salidaA[i] | NSER + NSEA + NSCRA ≥ N |
| TPS[j] | salida[j] | - | salidaV[j] | NSV ≥ M |

## Tiempo comprometido — Metodología EaE

### Servicio de delivery

Una pizzería, además de atender a clientes en su local, cuenta con un servicio de Delivery. Esta pizzería, no sólo se dedica a la elaboración y distribución de pizzas, sino que además, comercializa otros dos productos: empanadas y tortas. El objetivo del estudio consiste en determinar la dotación óptima de cadetes con moto para la distribución de pedidos del Delivery, de manera que se minimice el costo total de funcionamiento. Para ello se requiere conocer el Promedio de Espera de los clientes (PE) y el Porcentaje de Tiempo Ocioso de cada Cadete (PTO).
El funcionamiento del servicio de Delivery se puede esquematizar de la siguiente forma:

Los pedidos de los clientes son recibidos en forma telefónica (Recepción), luego se envían a cocina, donde el pedido es elaborado y preparado para su despacho (Preparación). A continuación, se designa para la entrega del pedido al cadete que pueda hacerlo más rápidamente (Distribución). Todo esto se realiza de acuerdo al orden de los pedidos.
Se tienen como dato los tipos de productos comercializados, el porcentaje de pedido de los mismos, y su tiempo de elaboración, el cual responde a una f.d.p. equiprobable:

| PRODUCTO | % DE PEDIDO | TIEMPO DE PREPARACiÓN |
|---|---|---|
| Pizzas | 80 | entre 15 y 20 minutos (TPP) |
| Empanada | 15 | entre 5 y 15 minutos (TPE) |
| Tortas | 5 | entre 5 y 10 minutos (TPT) |

El intervalo de tiempo entre pedidos (IA) responde a una fdp lineal entre 4 y 8 y f(8) = 2*f(4).
Se conocen además, el tiempo transcurrido entre la recepción de cada pedido y la notificación del mismo a los cocineros (TRP), y el tiempo empleado por el cadete en la entrega del pedido al cliente que lo solicitó (TDE). Ambos responden a una fdp conocida.

- **Datos:** IA (Intervalo entre pedidos), TRP (Tiempo entre recepción del pedido y notificación), TPP (Tiempo de preparación de pizza), TPE (Tiempo de preparación de empanadas), TPT (Tiempo de preparación de tortas), TDE (Tiempo de entrega)
- **Control:** C (Cadetes)
- **Resultado:** CTF (Costo total de funcionamiento), PE (Promedio de Espera de los clientes), PTO[C] (Porcentaje de Tiempo Ocioso de cada Cadete)
- **Estado:** TC[C]

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPLL | LlegadaP | LlegadaP | - | - |

### Gestoría

Una compañía que presta servicios de gestoría se encuentra analizando la incorporación de nuevos clientes. Para ello solicita un informe que contenga la siguiente información de su propia empresa, a saber:
A. Porcentaje de tiempo ocioso de sus gestores
B. Promedio de tiempo para entregar un trámite terminado
C. Promedio de facturación por gestor
Con esta información el directorio de la compañía espera poder evaluar cómo podría aprovechar a sus dos gestores para atender la cartera de clientes de sus competidores (requerimiento A), así como medir la eficiencia de su fuerza comercial respecto de lo que conoce de su competencia (requerimiento B y C).
Según lo informado por el Director de Operaciones cuando un cliente solicita un trámite, se designa el gestor que se desocupa primero, quien de forma inmediata da aviso del tiempo de la tramitación (TA), el cliente no acepta gestionar el trámite si se demora más de 7 días. Según consta, la frecuencia de pedidos (lA) y el tiempo de tramitación (TA) están dados por una f.d.p, conocida para cada tipo de trámite según se indica en el siguiente cuadro:

| Tipo de tramite | %de solicitud | Tiempo tramitación | Provincia | Precio del Trámite |
|---|---|---|---|---|
| Informe dominio automotor | 75% | Entre 1 y 2 días | Capital Federal | $27 |
| Inhibición automotor | 25% | Entre 2 v 4 días | Todo el País | $29 |

- **Datos:** TTIDA (Tiempo de tramitación IDA), TTIA (Tiempo de tramitación IA), IC (Intervalo entre clientes)
- **Control:** —
- **Resultado:** PTO1 (Porcentaje de tiempo ocioso gestor 1), PTO1 (Porcentaje de tiempo ocioso gestor 2), PETT (Promedio de tiempo para entregar un trámite terminado), PFG1 (Promedio de facturación gestor 1), PFG2 (Promedio de facturación gestor 2)
- **Estado:** TCG1 (Tiempo comprometido gestor 1), TCG2 (Tiempo comprometido gestor 2)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPLL | LlegadaC | LlegadaC | - | - |

### Batalla virtual

El Ejército Argentino solicitó desarrollar una simulación, que permita determinar la cantidad de médicos de guerra a enviar a los distintos enfrentamientos armados, de manera que se minimicen las pérdidas humanas. Para tomar tal determinación se necesita conocer el porcentaje de bajas humanas con respecto al total de heridos, y el tiempo promedio de espera de los heridos, que fueron atendidos a partir del momento que llegan a la zona donde se ubican los médicos.
Durante una batalla se sabe que un soldado será herido cada cierto tiempo, según una f.d.p conocida. También se conocen las f.d.p. que determinan los tiempos de atención médica a cada soldado. Estos tiempos se pueden determinar en el momento exacto en que es herido, debido al conocimiento común del batallón sobre los riesgos y posibles daños que se producen en una guerra.
Una vez que un soldado es herido, se estima una demora de 5 minutos hasta que sea trasladado al sector donde se ubican los médicos.
Un herido de gravedad (aproximadamente el 30% del total de heridos) sólo puede esperar hasta 20 minutos antes de ser asistido, de lo contrario morirá, mientras que el resto sobrevive aproximadamente 2 horas sin atención médica.

- **Datos:** IH (Intervalo entre heridas), TAH (Tiempo de atención de herido)
- **Control:** M (Médicos)
- **Resultado:** PBRH (Porcentaje de bajas humanas con respecto al total de heridos), TPEH (Tiempo promedio de espera de los heridos)
- **Estado:** TC[M] (Tiempo comprometido médico)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPLL | LlegadaH | LlegadaH | - | - |

### Locutorio "MoTasi"

Un locutorio ofrece los siguientes servicios:
- Verificación de Mails
- Navegación por la Web
- Verificación de Mails y Navegación
Los mismos son requeridos de acuerdo a los siguientes porcentajes respectivamente: 70%, 20% y 10%.
El locutorio cuenta con NC máquinas, las cuales prestan cualquiera de los servicios ofrecidos.
Se sabe que los clientes ingresan al locutorio con una frecuencia dada por la siguiente f.d.p.
f(x) = ax - 3/4 con 0 < x < 2.
Todos los clientes están dispuestos a esperar hasta 10 Min y solo el 20% de ellos esperará más.
El tiempo de atención se conoce desde el ingreso del cliente al locutorio y varía según el tipo de servicio solicitado. Para el servicio de verificación de mail, el tiempo de atención está dado por una f.d.p. equiprobable entre 10 y 20 min, en cambio si es navegación por la Web, el tiempo de atención está dado por una f.d.p equiprobable entre 30 y 60 min.
Un 60% de los clientes, sin importar el servicio que hayan tomado, deciden además hacer uso de la impresora. Para ello el locutorio cuenta con 3 impresoras, 2 impresoras chorro a tinta las cuales están conectadas al servidor 1, que no dará comienzo a la impresión hasta no tener trabajo de impresión para las dos impresoras y 1 impresora láser conectada al servidor 2, que dará comienzo apenas llegue la orden de impresión. Los tiempos de impresión de las impresoras chorro a tinta están dados por una f.d.p equiprobable entre 2 a 3 min, en cambio la impresora láser demora entre 1 a 2 min.
El locutorio maneja los trabajos de impresión de acuerdo a una distribución cíclica M para el servidor 1 y N para el servidor 2.
Para saber si el locutorio debe agregar o quitar computadoras y cuál es la mejor distribución cíclica para los servidores, la simulación debe proporcionar los siguientes datos:
Porcentaje de clientes que se retiraron sin ser atendidos, porcentaje de tiempo ocioso para cada PC, promedio de tiempo de espera para cada PC y cada impresora.

- **Datos:** IC (Intervalo entre clientes), TAM (Tiempo de atención de mail), TAN (Tiempo de atención de navegación), TICH (Tiempo de impresión chorro a tinta), TIL (Tiempo de impresión láser)
- **Control:** NC (Números de computadoras), M (Impresiones servidor 1), N (Impresiones servidor 2)
- **Resultado:** PCA (Porcentaje de clientes que se retiraron sin ser atendidos), PTO[NC] (Porcentaje de tiempo ocioso para cada PC), PEC[NC] (Promedio de tiempo de espera para cada PC), PECI1 (Promedio de tiempo de espera para impresora 1), PECI2 (Promedio de tiempo de espera para impresora 2), PECI3 (Promedio de tiempo de espera para impresora 3)
- **Estado:** TC[NC] (Tiempo comprometido de cada computadora)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPLLC | LlegadaC | LlegadaC | - | - |

### Impresoras

El centro de cómputos de una pequeña empresa dispone de dos impresoras en red donde se realizan todas las impresiones, una láser y otra a chorro de tinta. Se conoce el intervalo entre llegada de documentos al sistema (lA), que responde a una f.d.p lineal entre 5 y 10 minutos, donde f(10)= 2* f(5).
La impresora láser puede imprimir hasta 1000 páginas con su recarga de tóner llena, a una velocidad de 5 ppm. La impresora a chorro de tinta imprime 500 páginas con un cartucho nuevo a razón de 3 ppm.
La cantidad de páginas de los documentos generados por los usuarios (el cual se conoce al solicitarse la impresión) responde a una f.d.p uniforme entre 1 y 50 páginas.
Una vez llegados al servidor de impresión, los documentos se distribuyen cíclicamente M hacia la impresora láser y N hacia la chorro de tinta. Sabiendo que el costo del tóner es aproximadamente de 100 dólares y el del cartucho de tinta es de 60 dólares, se desea saber cuáles son los valores de M y N que minimizan el costo total de impresión y la espera en cola de los documentos.
Se comienza con los insumos de impresión nuevos, los cuales deben ser agotados en su totalidad antes de ser repuestos. El tiempo por recambio de insumos es despreciable.

- **Datos:** IA (Intervalo entre documentos), CP (Cantidad de páginas)
- **Control:** M (Ciclo M láser), N (Ciclo N chorro de tinta)
- **Resultado:** CTI (Costo total de impresión), PECL (Porcentaje de espera en cola láser), PECCH (Porcentaje de espera en cola chorro a tinta)
- **Estado:** TCL (Tiempo comprometido láser), TCCH (Tiempo comprometido chorro de tinta)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPLL | LlegadaD | LlegadaD | - | - |

### Cibercafé

Un cibercafé tiene N computadoras destinadas a navegación en Internet y M destinadas a juegos en red. Están numeradas de forma correlativa, tal que las primeras N son las de Internet y las M siguientes son las de juegos. Sus propietarios quieren averiguar si es correcta esta distribución y si es conveniente agregar más máquinas, debido a que potenciales clientes se van por no querer esperar. Según su método de atención, le preguntan a cada cliente cuanto tiempo desea usar la máquina (TU) en el momento de su llegada; dicho tiempo responde a una f.d.p conocida. Si quieren estar más tiempo del avisado, deben actuar como si recién hubieran llegado, le asignan a cada cliente la máquina del tipo que requieren que más rápido se va a desocupar. Además saben por su experiencia que el intervalo de arribo de clientes (lA) se da respondiendo a otra f.d.p, y que estadísticamente, el 70% de los clientes viene a navegar por Internet y el 30% restante a jugar. Por cuestiones particulares prefiere al público que viene a navegar sobre el que viene a jugar, por lo tanto si todas las máquinas destinadas a este fin están ocupadas, utilizan alguna de las destinadas a juegos; esto no se da en caso contrario. A fin de poder decidir qué hacer, se desea conocer el porcentaje de veces que una máquina de las de juegos es usada para navegación (PJN).

- **Datos:** IA (Intervalo entre clientes), TU (Tiempo de uso)
- **Control:** N (Computadoras para internet), M (Computadoras para jugar)
- **Resultado:** PJN (Porcentaje de veces que una máquina de juegos es usada para navegación)
- **Estado:** TC[N] (Tiempo comprometido computadora N), TC[M] (Tiempo comprometido computadora M)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPLL | LlegadaC | LlegadaC | - | - |

### Koalas

El Satélite Huno y el Satélite Dhos se utilizan para calcular la cantidad de koalas en Australia. Actualmente los pedidos de información de los satélites responden a una función equiprobable entre 5 y 10 minutos desde los países que conforman el Mercosur. El satélite Huno, es geoestacionario y permite la recepción de pedidos de todos los países del Mercosur y su tiempo de respuesta (Recepción + Procesamiento + Transmisión de Resultado) responde a una f.d.p. Su tiempo de atención se conoce desde que se recibe un pedido. Su disponibilidad es durante las 24 horas del día.
El satélite Dhos, gira en una órbita más baja, por ende gira a mayor velocidad que la rotación de la Tierra. Se sabe que va a estar disponible desde las 0 horas hasta las 5 horas todos los días (de acuerdo al huso horario argentino). Su tiempo de respuesta (Recepción + Procesamiento + Transmisión de Resultado) responde a otra f.d.p. Este tiempo de atención también se conoce desde que se recibe un pedido.
Si el tiempo de espera en la atención del pedido es inferior a los 10 minutos, espera. Sólo el 20% de los pedidos permanecerán si se encuentra entre los 10 Y 15 minutos, pasado este tiempo desisten del intento. El objetivo de la simulación será calcular el porcentaje tiempo ocioso total para determinar la posible inclusión de un nuevo país en el uso de los Satélites.

- **Datos:** IP (Intervalo entre pedidos), TRH (Tiempo de atención H), TRD (Tiempo de atención D)
- **Control:** —
- **Resultado:** PTO (Porcentaje de tiempo ocioso total)
- **Estado:** TCH (Tiempo comprometido H), TCD (Tiempo comprometido D)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPLL | LlegadaP | LlegadaP | - | - |

### Aeropuerto

Se conocen los intervalos de Arribo (IA) y de despegue (ID) de aviones de chico, mediano y gran porte de un aeropuerto que está por ser ampliado, la ampliación consiste en la construcción de una determinada cantidad adicional de pistas que ayudaran a descongestionar el tráfico aeronáutico en el aeropuerto. Se necesita optimizar la cantidad de pistas que debe tener, tomando en cuenta la siguiente tabla de tiempos de despegue y aterrizaje según el tamaño de la aeronave. Sabiendo que la probabilidad de que sea una nave chica es del 50%, una nave mediana es del 30% y una nave grande, el 20%

| Tipo Avión | Tiempo en despegar | Tiempo en aterrizar |
|---|---|---|
| Chico (Hasta 10 pasajeros) | 120 seg. | 200 seg. |
| Mediano (Hasta 100 pasajeros) | 400 seg. | 490 seg. |
| Grande (Mas de 100 pasajeros) | 900 seg. | 1200 seg. |

Se sabe que los domingos el tráfico se reduce a la mitad, y que los controladores aéreos envían a los aviones; independientemente de su tamaño, a la pista donde tendrán que esperar menos en el caso del despegue y del aterrizaje. En caso de igualdad, el controlador enviará al avión a cualquier pista en esa situación. Se pide calcular: Promedio de espera para el despegue.

- **Datos:** IAC (Intervalo entre arribos de aviones chicos), IAM (Intervalo entre arribos de aviones medianos), IAG (Intervalo entre arribos de aviones grandes), IDC (Intervalo entre despegue de aviones chicos), IDM (Intervalo entre despegue de aviones medianos), IDG (Intervalo entre despegue de aviones grandes)
- **Control:** P (Pistas)
- **Resultado:** PED (Promedio de espera para el despegue)
- **Estado:** TCA (Tiempo comprometido aterrizaje), TCD (Tiempo comprometido despegue)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPA | Aterrizaje | Aterrizaje | - | - |
| TPD | Despegue | Despegue | - | - |

Hay una variante resuelta con un solo TA y TD, donde se calcula random
Falta cálculo de DIV donde debe contabilizar el día de la semana y tomar el valor 1 si es día de semana y 2 si es fin de semana

### Ecografías

En el área de ecografías de un centro de diagnósticos médicos se realizan dos tipos de ecografías, tipo A y tipo B. Los pacientes que llegan se realizan alguno de estos dos tipos de estudios o ambos. El 45% de los pacientes se realizan la ecografía del tipo A; el 40% la del tipo B y el 15% debe realizarse ambas ecografías. A aquellos pacientes que corresponden a este 15%, se les asigna primero el turno de la ecografía que se desocupe primero (Tipo A o Tipo B). Se sabe que el intervalo entre arribos de los pacientes responde a una f.d.p. del tipo f(x) = mx + b en el intervalo [5,10] siendo f(5) = 2. También se conoce el tiempo de duración de cada uno de los estudios que responde a dos f.d.p. conocidas.
Se desea saber el tiempo medio de espera de los pacientes y el porcentaje de inactividad de los dos médicos.

- **Datos:** IA (Intervalo entre pacientes), TDA (Tiempo de duración A), TDB (Tiempo de duración B)
- **Control:** —
- **Resultado:** PEP (Promedio de espera de los pacientes), PTO1 (Porcentaje de tiempo ocioso 1), PTO2 (Porcentaje de tiempo ocioso 2)
- **Estado:** TCA (Tiempo comprometido A), TCB (Tiempo comprometido B)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPLL | LlegadaP | LlegadaP | - | - |

### Molino eólico

En un pueblo de la Patagonia Argentina se instala un molino eólico, el cual genera 12V de energía con una potencia de 2000 watts. El mismo tiene la función de cargar las baterías que se utilizarán por los campesinos en los campos vecinos. Para ello se quiere conocer el tiempo medio de espera de los campesinos y el porcentaje de tiempo inactivo de carga del molino.
Se cuenta con una información básica que corresponde a una f.d.p equiprobable:

| Clase | Modelo | % de Atención | Tiempo de Carga |
|---|---|---|---|
| A | BAT23 | 55 | Entre 60 y 70 Min |
| B | BAT22 | 25 | Entre 40 y 50 Min |
| C | BAT21 | 20 | Entre 30 y 40 Min |

Los campesinos solicitan un turno telefónicamente a la Municipalidad (con un intervalo entre llamadas que responde a una fdp), describiendo el modelo de batería que poseen, para la carga de la misma.

- **Datos:** ILL (Intervalo entre llamadas), TCA (Tiempo de carga clase A), TCB (Tiempo de carga clase B), TCC (Tiempo de carga clase C)
- **Control:** —
- **Resultado:** PEC (Promedio de espera de los campesinos), PTO (Porcentaje de tiempo inactivo)
- **Estado:** TCM (Tiempo comprometido del molino)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPLL | Llegada | Llegada | --- | --- |

### Lavadero de autos

Los autos llegan al sistema con una frecuencia que responde a una f.d.p, uniforme entre 0 y 120 minutos. El tiempo de atención se conoce desde la llegada del auto al sistema y responde a la función del gráfico. La máquina permite que se lave un segundo auto a partir de que el auto anterior cumplió con la mitad de su tiempo de atención. Todos los autos esperan hasta 15 minutos. El 60% de los autos espera hasta 30 minutos. Ningún auto espera más de 30 minutos.

- **Datos:** IA (Intervalo entre arribos), TA (Tiempo de atención)
- **Control:** —
- **Resultado:** PPS (Promedio de permanencia en el sistema)
- **Estado:** TCM (Tiempo comprometido de máquina)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPLLP | LlegadaAuto | LlegadaAuto | - | - |

### Aula Ya!

Simular el funcionamiento de una página web la cual ofrece un servicio de clases particulares online. Para esto tiene un pool de profesores para brindar el servicio durante las 24hs, los 7días de la semana.
Cada profesor está disponible ciertos días de la semana y en un rango horario (mañana, tarde o noche) determinado de acuerdo a su contrato.
Por ahora sólo se ofrecen clases particulares de matemática, física y química.
El objetivo de la simulación es poder averiguar la mínima cantidad de profesores de cada materia en el turno tarde para minimizar el promedio de espera de los estudiantes.
En cuanto a los datos, se conoce: El intervalo entre arribos de estudiantes (expresado en minutos) y la duración de la clase (conocido de antemano) viene dada por una distribución de 72% de 30 minutos, 24% de 1 hora y 4% de 2 horas.
Cabe aclarar que también se conoce el porcentaje de alumnos discriminado por materia. El 72% toman clases de Matemática, el 13% de Física y el 15% de Química.

- **Datos:** IA (Intervalo entre arribos de estudiantes), DC (Duración de la clase)
- **Control:** PTTM (Profesor turno tarde matemática), PTTF (Profesor turno tarde física), PTTQ (Profesor turno tarde química)
- **Resultado:** PEM, PEF, PEQ
- **Estado:** TC[M] (Tiempo comprometido matemática), TC[F] (Tiempo comprometido física), TC[Q] (Tiempo comprometido química)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPLLA | LlegadaAlumno | LlegadaAlumno | - | - |

### Cobradores S.A.

La empresa Cobradores S.A. se dedica a cobrar por orden de terceros. Sus clientes realizan las órdenes de cobro telefónicamente a la central de la empresa cada cierto tiempo dado por una FDP (IO), momento a partir del cual se conoce el tiempo que se demorará en realizar la gestión (TG) dado por una FDP. La empresa cuenta con N cobradores que trabajan en la calle y reciben por handy la dirección por la que deben pasar a cobrar y el monto a cobrar, valor que responde también a una FDP (MON). Por cuestiones de seguridad, cada cobrador debe hacer un viaje al banco al acumular una cantidad D de dinero y depositarlo en una cuenta. El tiempo que durará este viaje está dado por una FDP (VB) que incluye el tiempo del trámite bancario.
La gerencia de la empresa desea determinar la cantidad de cobradores y el límite de dinero ante el cual cada cobrador debe dirigirse al banco para minimizar el porcentaje tiempo ocioso de cada cobrador y el porcentaje que representa el tiempo de viajes al banco respecto del tiempo total trabajado por cada cobrador.

- **Datos:** IO (Intervalo entre cobros), TG (Tiempo de gestión), MON (Monto a cobrar), VB (Viaje al banco)
- **Control:** N (Cobradores), D (Máximo de dinero)
- **Resultado:** PTO[i], PTBRT[i] — % de tiempo en el banco respecto al trabajado
- **Estado:** TC[i]

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPLLC | LlegadaCobro | LlegadaCobro | - | - |

## Transporte — Metodología EaE

### Repostería

De acuerdo al gráfico se trata de una organización que se encarga de cocinar tortas de repostería. Poseen dos hornos, uno a gas y otro eléctrico. Recepción toma el pedido y se lo pasa al sector de preparación y distribución, quien envía las tortas a ambos hornos (Cíclicamente). Luego se pasa al sector embalaje y termina el ciclo al llegar nuevamente a recepción. El horno a gas, por razones políticas de la organización, debe encenderse únicamente con tres tortas. El horno eléctrico sólo tiene capacidad para una torta por vez. Se trata de obtener la mejor distribución cíclica que minimice el promedio del tiempo del circuito.

| Recepción / R |   | RD |   | Distribución / D |
|---|---|---|---|---|
|   |   |   | DGH |   |
| ER | HGE | Horno a Gas / HG |   | DHE |
| Embalaje / E |   | HEE |   | Horno Eléctrico / HE |

Los pedidos llegan con una frecuencia que es conocida, en Recepción se produce una demora entre la recepción del pedido y la transferencia al sector Distribución. Este último sector también tiene un tiempo de demora desde que recepciona el pedido y lo prepara para el siguiente paso, que es enviarlo a alguno de los hornos. Los tiempos de cocción son distintos según sea el horno eléctrico o el horno a gas. Finalmente se produce una demora entre el embalaje y el envío de la torta al sector Recepción.
Durante todo el proceso se respeta el orden de llegada de los pedidos.

- **Datos:** IP (Intervalo entre pedidos), RD (Tiempo en llegar a distribución), DHG (Tiempo en enviar a hornear a gas), TCG (Tiempo de cocción a gas), DHE (Tiempo en enviar a hornear eléctrico), TCE (Tiempo de cocción eléctrica), HGE (Tiempo en embalar torta a gas), HEE (Tiempo en embalar torta eléctrica), ER (Tiempo en enviar a recepción)
- **Control:** THG (Tortas horno a gas), THE (Tortas horno eléctrico)
- **Resultado:** PTTP (Promedio de tiempo total de pedido)
- **Estado:** TCHG (Tiempo comprometido horno a gas), TCHE (Tiempo comprometido horno eléctrico)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPLL | llegadaPedido | llegadaPedido | - | - |

### Sistema de lavado de ropa

Un local de lavado de ropa posee 2 máquinas lavadoras de distintas características (distintas f.d.p) y una maquina secadora. La capacidad de estas máquinas es de sólo una canasta de ropa.
El sector de distribución se encarga de tomar los canastos de ropa que se presentan en intervalos aleatorios que responden a una f.d.p equiprobable entre 1 y 10 minutos; luego los distribuye cíclicamente entre la maquina 1 y la maquina 2; terminado el proceso de lavado se vuelve a colocar la ropa en canastos y se envía el canasto a la máquina secadora.

|   | AC | Máquina Lav. 1 | EF |   |   |   |   |
|---|---|---|---|---|---|---|---|
| Distribución |   |   |   | Máquina secado | GH | Embalaje | I |
|   | AB | Máquina Lav. 2 | DF |   |   |   |   |

Finalizado este proceso se vuelve a colocar la ropa en su canasto y se envía al proceso siguiente que es el embalaje, para su posterior entrega. Todos los pasos del proceso se realizan respetando el orden de llegada de los canastos. .
Se conocen las f.d.p. de los tiempos entre AC, AB, CE, BD; EF, DF, FG, GH, HI.
La simulación debe proporcionar 'la información necesaria para elegir la mejor distribución cíclica que haga mínimo el tiempo total del proceso completo:

- **Datos:** IC (Intervalo entre canastos), AC (Tiempo de derivación máquina 1), AB (Tiempo de derivación máquina 2), CE (Tiempo de lavado máquina 1), BD (Tiempo de lavado máquina 2), FG (Tiempo de secado), HI (Tiempo de embalaje)
- **Control:** CM1 (Canastos máquina 1), CM2 (Canastos máquina 2)
- **Resultado:** TPC (Tiempo de proceso completo)
- **Estado:** TCM1 (Tiempo comprometido máquina 1), TCM2 (Tiempo comprometido máquina 2), TCS (Tiempo comprometido secadora)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPLL | LlegadaCanasto | LlegadaCanasto | - | - |

## Mantenimiento — Metodología EaE

### Orquesta de cuerdas

Una orquesta de cámara decidió proveerles a sus violinistas las cuerdas que utilizan en su instrumento. Para realizar esto se deberá estudiar el costo de mantenimiento de las cuerdas de un violín.
El cambio de encordado (total de cuerdas) se debe realizar cada cierta cantidad de días y su costo será de $80. Un violín consta de cuatro cuerdas numeradas desde la más fina (la 1ra) hasta la más gruesa (la 4ta). En caso de rotura de alguna cuerda se deberá analizar el tiempo transcurrido desde el último cambio de encordado en base a un porcentaje del plazo de cambio. En el momento de la rotura si el tiempo transcurrido es menor que el establecido por el porcentaje, se reemplazará sólo la cuerda rota en el caso que sea la 1ra. Si el tiempo transcurrido es mayor o se trata de la 2da, 3ra y 4ta cuerda se deberá realizar un cambio de encordado, modificando la fecha del próximo cambio de encordado.
La vida útil de una cuerda se toma como el tiempo en que la calidad del sonido y algunos otros factores se mantienen estables. La vida útil de la 1ra cuerda se calcula entre 90 y 120 días (f.d.p. equiprobable). La vida útil de las restantes cuerdas juntas está entre 180 y 240 días (f.d.p. equiprobable). El costo del encordado varía de forma aleatoria y equiprobable entre $100 y $150. El costo de las cuerdas individuales varía de la misma manera que el encordado entre $ 20 Y $30.
Se necesita obtener información para poder establecer el plazo de cambio de encordado y el porcentaje teniendo en cuenta un costo total mínimo.

- **Datos:** VUPC (Vida útil primera cuerda), VUOC (Vida útil otras cuerdas), CE (Costo de encordado), CCI (Costo cuerda individual)
- **Control:** DCE (Días para cambio de encordado), PJE (Porcentaje de plazo de cambio)
- **Resultado:** CTM (Costo total de mantenimiento)
- **Estado:** CTM (Costo total de mantenimiento)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPCE | cambioEncordado | cambioEncordado | - | - |

### Cuestión de segundos

La escudería más prestigiosa de Fórmula 1 desea recuperar su poderío, perdido en los últimos años a manos de su entrañable rival. Con tal fin, el ambicioso dueño ha contratado a un grupo de profesionales para mejorar los tiempos que consumen las entradas a boxes.
La mayoría de las veces, en boxes se lleva a cabo el cambio de neumáticos y la carga de combustible. La carga de combustible se realizará cada CC vueltas, y para aprovechar la entrada a boxes, si faltan menos de M vueltas para el plazo de cambio de neumáticos, este también se realiza.
La vida útil de los neumáticos (VUN) responde a una función lineal, entre 10 Y 15 vueltas, siendo f(15} = 2*f(10). Cuando se cambian los neumáticos, también se cargará combustible según falten menos de N vueltas para el próximo plazo de carga de combustible.
La penalización de tiempo por cargar combustible solamente (PCC) es aleatoria, equiprobable entre 5,3 y 7,6 segundos, mientras que la f.d.p. de penalización por cambiar los neumáticos solamente (PCN) es equiprobable entre 4,5 y 6,7 seg.
La penalización por cambiar los neumáticos y cargar combustible (PCNC) es aleatoria, equiprobable entre 6,2 y 9,4 segundos.
El 5% de las veces que se quiere ingresar a boxes, éstos están ocupados, y se debe esperar a la próxima vuelta para poder entrar.
T se mide en vueltas al circuito, el objetivo de la simulación es proporcionar información para decidir cuáles son los valores de M, N y CC que hacen mínima la penalización total (PT). Hallar el porcentaje de veces que encontró boxes ocupado.

- **Datos:** VUN (Vida útil de neumáticos), PCC (Penalización de tiempo por cargar combustible), PCN (Penalización por cambiar los neumáticos), PCNC (Penalización por cambiar ambos)
- **Control:** CC (Vueltas para carga de combustible), M (Vueltas límite para cambio de neumáticos), N (Vueltas límite para carga de combustible)
- **Resultado:** PT (Penalización total), PVBO (Porcentaje de veces que encontró boxes ocupado)
- **Estado:** TCN (Tiempo de cambio de neumático), TCC (Tiempo de carga de combustible)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TCN | cambioNeumático | cambioNeumático | cargaDeCombustible | TCC – T < N |
| TCC | cargaDeCombustible | cargaDeCombustible | cambioNeumático | TCN – T < M |

### Ricky

Ricky tiene una cuenta de e-mail <ricky@afdb.com.ar> donde el servidor le permite alojar mensajes. Se conoce el intervalo entre arribos de mensajes a la cuenta (Fdp1) y el intervalo (Fdp2) en el cual Ricky lee todos sus e-mails (luego de leerlos se borran automáticamente). También se conoce el tiempo de mantenimiento del servidor (Fdp3), tiempo que es contabilizado a partir de detectarse 100 mensajes.
Este mantenimiento de la cuenta de Ricky se realiza si sigue habiendo en ese momento 100 o más mensajes. En ese caso se borra una cantidad fija CF de mensajes y, si luego de esto, sigue habiendo 100 o más mensajes se borra una cantidad variable-CV que corresponde a un porcentaje de la cantidad de e-mails en exceso.
Se desea conocer el porcentaje de e-mails borrados por el servidor, y Ia cantidad de mantenimientos realizados, a fin de establecer la mejor combinación de CF y CV.

- **Datos:** IM (Intervalo entre mensajes), IL (Intervalo entre lecturas), TM (Tiempo de mantenimiento)
- **Control:** CF (Cantidad fija de mails a borrar), CV (Cantidad variable de mails a borrar)
- **Resultado:** PEB (Porcentaje de emails borrados), CMR (Cantidad de mantenimientos realizados)
- **Estado:** CM (Cantidad de mails)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPL | Lectura | lectura | - | - |
| TPE | llegadaEmail | llegadaEmail | mantenimiento | CM ≥ 100 |
| TPM | mantenimiento | - | - | - |

### Reducción de Costos

En un consorcio, de un edificio el encargado consideró que los costos de mantenimiento del ascensor eran elevados. Este mantenimiento se realizaba cada cierta cantidad de días teniendo en cuenta la vida útil del tubo de luz. Llegada esa fecha, se llamaba a personal externo, los cuales realizaban el mantenimiento del ascensor y cambiaban el tubo.
Para evaluar los costos totales de mantenimiento se realiza la siguiente simulación. El cambio del tubo de luz se hace teniendo en cuenta la vida útil, que corresponde a un f.d.p entre 15 y 20 días, siendo f(20)= 3 f(15). Si para realizar el mantenimiento faltan menos de M días, se llama a los técnicos y se realizan las dos cosas; caso contrario el encargado cambia el tubo. El mantenimiento se realiza cada N días; solo se cambia el tubo en caso de que coincidan las fechas. Los costos son fdp conocidas.

- **Datos:** VUT (Vida del tubo), CMT (Costo mantenimiento tubo), CMA (Costo mantenimiento ascensor)
- **Control:** N (Días para mantenimiento de ascensor), M (Días límite para mantenimiento de ascensor)
- **Resultado:** CTM (Costo total de mantenimiento)
- **Estado:** CTM (Costo total de mantenimiento)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TCT | cambioTubo | cambioTubo | mantenimientoAscensor | TCT – T < M |
| TMA | mantenimientoAscensor | mantenimientoAscensor | cambioTubo | TCT = TMA |

## Stock (almacenamiento intermedio) — Metodología EaE

### Productos Lácteos

Una empresa que se dedica a la fabricación y venta de productos lácteos, cuenta con un puesto de venta al que cada cinco días llegan los productos. Entonces, se descartan todos los productos que no han sido vendidos hasta el momento, por tratarse de productos perecederos que sólo pueden ser vendidos dentro de este período.
Si se vendieran todos los productos antes de cumplirse los cinco días, se adelanta la entrega siguiente, que tarda en llegar un período (TEE) determinado por una f.d.p, conocida que varía entra 10 y 30 minutos. Si lIega un cliente durante este período, se retira.
Las ventas se producen a intervalos (IV) determinados por una f.d.p.
Se desea determinar la cantidad M de productos a transportar hacia el punto de venta, para minimizar la cantidad de productos desechados, la cantidad de clientes que no son atendidos y la cantidad de viajes hacia el punto de venta. Para ello se desea obtener el porcentaje de productos descartados respecto del total de productos que llegan al puesto (PPD) , el porcentaje de dientes que no pudieron ser atendidos (PCNA) y el promedio de tiempo entre entregas (PTEJ).

- **Datos:** TEE (Tiempo de entrega), IV (Intervalo de ventas)
- **Control:** M (Productos a transportar)
- **Resultado:** PPD (% de productos descartados respecto del total), PCNA (% de clientes que no pudieron ser atendidos), PTEJ (Promedio de tiempo entre entregas)
- **Estado:** ST

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPV | venta | venta | pedido | ST = 0 ^ TPP = HV |
| TPP | pedido | - | - | - |

## EaE mezclada (eventos que no son colas)

### Problema del Faraón

Simul-tep era un faraón egipcio que deseaba construir una pirámide para que cuando muriera pudiese tener un lugar donde permanecer por el resto de la eternidad. Las intenciones de Simul-tep eran construir una pirámide lo más alta posible antes de morirse usando la menor cantidad de esclavos. Las pirámides se construyen poniendo las piedras sacadas de una cantera cercana una sobre la otra, teniendo en cuenta que el piso k tendrá k2 piedras. Las piedras son trasladadas por 10 esclavos a través del desierto en un tiempo (TVP - Tiempo de Viaje de la Piedra) que sigue una f.d.p. normal entre 10 y 20 días. Una vez colocada la piedra cada esclavo vuelve a la cantera en un tiempo (TVE - Tiempo de Viaje del Esclavo) representado por un f.d.p. equiprobable entre 1 y 2 días.
Se desea saber el tiempo de construcción (TC) y el porcentaje de tiempo ocioso de los Esclavos (PTOE) para cada altura (HF) y cantidad de esclavos (E) usados.
NO SE ENTIENDE EL ENUNCIADO

- **Datos:** TVP (Tiempo de viaje de la piedra), TVE (Tiempo de viaje del esclavo)
- **Control:** E (Esclavos), HF (Altura)
- **Resultado:** TC (Tiempo de construcción), PTOE (Porcentaje de tiempo ocioso de los esclavos)
- **Estado:** P (Piedras)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPV | Viaje | Viaje | - | - |

### Estudio del suelo

Se necesita minimizar los costos de una empresa dedicada al estudio del suelo. Para ello se emplearán métodos de Simulación de manera tal que pueda hacerse uso eficiente de 2 máquinas autónomas que estudian les factores dinámicos en dos zonas apartadas de la ciudad.
Un operario debe reponer la batería que cada una utiliza, mediante una alarma que avisa en forma remota a la central. Las baterías pueden ser de capacidad variable y estará dada por la cantidad de celdas que posea, la duración de cada celda está dada por una fdp conocida distinta para cada máquina.
En caso de que suene la alarma (lo que indica que la batería está utilizando la última celda), el operario debe acudir al lugar a cambiarla. El valor del recambio responde a una f.d.p. conocida distinta para cada máquina, y además se suma el costo del viaje del operario. Si se encuentra en la planta 1, $40 y $60. Si se encuentra en la planta 2, $65 y $35. El operario tiene 35% de probabilidades de encontrarse en la planta 1, y 65% de encontrarse en la planta 2.
Se desea averiguar el costo total de mantenimiento de cada máquina para distintas capacidades de las baterías.

- **Datos:** DC1 (Duración de celda máquina 1), DC2 (Duración de celda máquina 2), CB1 (Costo batería máquina 1), CB2 (Costo batería máquina 2)
- **Control:** CB (Capacidad de batería)
- **Resultado:** CTM1 (Costo total máquina 1), CTM2 (Costo total máquina 2)
- **Estado:** CTM1 (Costo total máquina 1), CTM2 (Costo total máquina 2)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TCM1 | cambioM1 | cambioM1 | - | - |
| TCM2 | cambioM2 | cambioM2 | - | - |

### Compañía ferroviaria

Una compañía ferroviaria pretende determinar la frecuencia óptima en el servicio de sus trenes en un ramal determinado, y la formación (número de vagones) óptima, que evite la saturación de personas en el andén (promedio de pasajeros esperando).
Para ello se ha decidido realizar un estudio sobre el último tramo del recorrido, dado que se ha comprobado estadísticamente que es el tramo de mayor concurrencia en el pasaje.
Los pasajeros llegan al andén con una frecuencia dada por una f.d.p. equiprobable entre 0 y 3 minutos. Una vez en el andén, se distribuyen de manera uniforme (aproximadamente) a lo largo del mismo, de modo que puede suponerse que todos los coches del tren llevarán la misma cantidad de pasajeros.
El tren llega al andén con una cantidad de pasajeros dada por otra f.d.p. entre 15 y 25 por vagón, con el doble de probabilidad de que sean 15 que 25.
Si hay espacio para todos los pasajeros que esperan el tren, el andén se vacía; en caso contrario, suben al tren la cantidad de pasajeros posible hasta ocupar la capacidad máxima y el resto aguarda el próximo tren.
No hay un orden establecido para la forma en que los pasajeros suben al tren. Cada vagón del tren tiene una capacidad de 50 pasajeros.

- **Datos:** AP (Arribo de pasajeros), PT (Pasajeros en el tren)
- **Control:** FO (Frecuencia óptima), NV (Número de vagones)
- **Resultado:** PPE (Promedio de pasajeros esperando)
- **Estado:** PA (Pasajeros en andén)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPLLP | LlegadaPasajero | LlegadaPasajero | - | - |
| TPLLT | LlegadaTren | LlegadaTren | - | - |

### Selección De Arquitectura Web, Elección Del Enfoque A Contratar

La mayoría de los productos o proyectos en los que trabaja nuestra empresa están focalizados en lo que es arquitectura web, por lo que los servidores destinados al procesamiento de request son un recurso clave para la actividad.
La información necesaria para llevar a cabo la simulación consta de los intervalos entre arribos de los request y los tiempos de atención que conllevan .
Se necesita modelar una solución que emplea servidores con el fin de procesar request, el objetivo final es saber si contratar esa solución que emplea servidores según lo descripto ó buscar otra. Además, adelante del conjunto de servidores va a existir un balanceador de carga que es el que distribuye los pedidos que puedan ser atendidos, encolando a los que todavía no pueden serlo.
Existen dos tipos de request: aquellos que necesitan de recursos estáticos y aquellos que necesitan recursos calculados para poder ejecutarse. Se diferencian claramente en que estos últimos necesitan de un tiempo de atención mucho más prolongado. En esta primera solución hay que activar la totalidad de los servidores disponibles para la atención de los request.
La política de distribución de request será por round robin (método para seleccionar elementos). Por un requerimiento de seguridad del proveedor que ofrece esta solución, los request no deberán superar un tiempo máximo (TIMEOUT), en caso de superarlo será rechazada la conexión.
Se conoce con certeza el tiempo en que serán atendidas las peticiones, desde el momento en que estas ingresan al sistema.
Se sabe cuál es el costo mensual por equipo de alojamiento en el data center ofrecido por el proveedor.
Además se pide calcular: Promedio de costos mensual, Porcentaje de request rechazados, Porcentaje de tiempo ocioso de los servidores, Promedio de tiempo de espera de los request, y Promedio de tiempo de respuesta.

- **Datos:** IA, TAE, TAC
- **Control:** S (Servidores)
- **Resultado:** PCM (Promedio de costos mensual), PRR (Porcentaje de request rechazados), PTO[i] (Porcentaje de tiempo ocioso de los servidores), PEC (Promedio de tiempo de espera de los request), PTR (Promedio de tiempo de respuesta)
- **Estado:** TC[i] (Tiempo comprometido de servidor)

| TEF | Evento | E.F.NO C. | E.F.C. | Condición |
|---|---|---|---|---|
| TPR | LlegadaRequest | LlegadaRequest | - | - |

CMA = Costo mensual de alojamien

## Incremento constante — Metodología Δt

### Cultivo

Un agricultor posee un cultivo que necesita ser regado con 10 a 25 litros diarios de agua. Para ello desea instalar un tanque que será aprovisionado con 12 a 35 litros diarios de agua por un molino impulsado por el viento (el 65% de los días hay viento).
En caso de que la cantidad de agua almacenada no resulte suficiente, se utilizará un motor diesel para proveer el faltante, generando un gasto de $0,35 por litro de agua suministrado. Se desea conocer el porcentaje de días que se utilizó el motor y el costo total generado por su uso, sabiendo que al comienzo de la simulación el tanque está vacío.

- **Datos:** NR (Necesidad de riego), AM (Agua del molino)
- **Control:** CAP (Capacidad del tanque)
- **Resultado:** PDUM (% de días en que se usó el motor), CT (Costo total)
- **Estado:** AA (Agua almacenada en tanque)

| TEF | Evento Propio Δt | Evento Comprometido Δt Futuro | Evento Comprometido Δt Anteriores |
|---|---|---|---|
| - | Entra agua de molino | - | - |
|   | Sale agua por riego | - | - |

### Banco internacional

Un grupo propietario de un Banco internacional con una red de cajeros automáticos nos solicita que efectuemos una simulación sobre sus sistemas de procesamiento, con la finalidad de establecer el tiempo máximo en el cual se encuentra en funcionamiento el procesador central.
Sabiendo que las transacciones se almacenan en una memoria intermedia, se pide que determine la cantidad máxima de sus transacciones que quedaron en memoria sin ser procesadas y a qué hora ocurrió.
Se conoce la cantidad de depósitos que se efectúan por hora en cada cajero.
Se conoce la cantidad de extracciones que se efectúan cada 20 minutos en cada cajero. Dichas cantidades responden a una función de densidad de probabilidad.
La reposición de dinero se efectúa una vez al día a las 9:30 hs.
La cantidad de cajeros automáticos en funcionamiento es de 1230 (fuera de horario bancario) y de 1700 en horario bancario (de 10 hs. a 15 hs.).
El procesador central tiene una capacidad de operar N depósitos por segundo y M extracciones por segundo.

- **Datos:** CD, CE20M — Cantidad de depósitos / hora / Cantidad de extracciones / 20 min
- **Control:** N, M — Depósitos / segundo / Extracciones / segundo
- **Resultado:** CMTM (Cantidad máxima de transacciones en memoria), HCMT (Hora CMTM)
- **Estado:** NS

| TEF | Evento Propio Δt | Evento Comprometido Δt Futuro | Evento Comprometido Δt Anteriores |
|---|---|---|---|
| - | Ingreso transacciones | - | - |
|   | Atención de transacciones | - | - |

### Atleta

En un laboratorio químico se está trabajando sobre el rendimiento que alcanza un atleta en una
maratón de 20km (4 horas).
Se conoce el nivel máximo de líquidos del atleta al comenzar la competencia. A cada minuto el atleta recibe una ración constante de agua destilada ubicada en puestos a lo largo del circuito. La cantidad de líquidos que consumen el cuerpo del atleta es conocida y expresada en cm3 por minuto.
Se desea informar el porcentaje de tiempo en minutos en que las reservas de líquidos del cuerpo del atleta se encuentran por encima del máximo establecido.

- **Datos:** CLC — Cantidad de líquido que consume (cm3 / min)
- **Control:** NML (Nivel máximo de líquido)
- **Resultado:** PTRSM — Porcentaje del tiempo en que las reservas superan el máximo / min
- **Estado:** NL (Nivel de líquido)

| TEF | Evento Propio Δt | Evento Comprometido Δt Futuro | Evento Comprometido Δt Anteriores |
|---|---|---|---|
| - | Entra por ración | - | - |
|   | Sale por consumo | - | - |

Cte CLR = cantidad de líquido de ración

### Desechos radioactivos

Una planta que genera desechos radioactivos debe alquilar tanques especiales para almacenar y luego desechar sus desperdicios. Se conoce la cantidad de desperdicio generados por día, que responde a una f.d.p. expresada en m3 por día, cuyo valor máximo diario no supera la capacidad del menor de los tanques.
La empresa que provee los tanques especiales cobra un alquiler diario de $5 por cada m3 del tanque multiplicado por 1,2 si la capacidad es inferior a 100 m3 y 1,5 si es superior. Estos índices se deben a que a mayor capacidad del tanque, se necesita mayor espesor del material.
Al llenarse un tanque, la planta tiene un costo asociado con el reemplazo del mismo de $100 (el cambio es automático e instantáneo).
Se desea conocer la capacidad en m3 del tanque que permita minimizar los costos de alquiler y reemplazo de los tanques.

- **Datos:** DG (Desechos generados)
- **Control:** CT (Capacidad de tanque)
- **Resultado:** CTA (Costo de alquiler), CTR (Costo de reemplazo)
- **Estado:** CT (Costo total)

| TEF | Evento Propio Δt | Evento Comprometido Δt Futuro | Evento Comprometido Δt Anteriores |
|---|---|---|---|
| - | Almacenamiento de desechos | - | - |
|   | Eliminación de desechos | - | - |

### Sistema de tarjetas magnéticas para ingreso de personal

Una empresa cuenta con un sistema de tarjetas magnéticas para el ingreso de empleados compuesto por 2 lectores de banda magnética. Todos los días el horario de entrada es de 8:45 a 9:00 hs y los empleados llegan al sistema de acuerdo a una f.d.p, entre 8 y 14 por minuto. El tiempo que se tarda en pasar la tarjeta por alguno de los dos lectores es de 0,25 minutos. Los lectores requieren un tiempo de mantenimiento de 1 minuto durante el cual sincronizan sus relojes. Esto sucede dentro del horario de entrada sólo el 5% de las veces y debe esperarse la finalización de dicho proceso para continuar con las lecturas.
Se desea realizar una simulación que determine la cantidad óptima de lectores de tarjetas magnéticas a colocar en la entrada de personal de la empresa y además determinar el porcentaje de empleados que aún están esperando para fichar cuando el reloj marca las 9 hs, promedio de empleados por lector y tiempo perdido en mantenimiento.

- **Datos:** IA (Personas/minuto)
- **Control:** LT (Lectores de tarjetas)
- **Resultado:** PEEF (% de empleados esperando a fichar), PEL[i] (Promedio de empleados lector [i]), TPM (Tiempo perdido de mantenimiento)
- **Estado:** E (Empleados)

| TEF | Evento Propio Δt | Evento Comprometido Δt Futuro | Evento Comprometido Δt Anteriores |
|---|---|---|---|
| - | Ingreso x llegadas | - | - |
|   | Salida x fichaje | - | - |

### Almacenaje de granos

Se desea simular el proceso de almacenaje de granos en una terminal portuaria, la misma tiene un silo de almacenaje el cual es abastecido por los barcos que anclan en la terminal. El silo tiene una capacidad máxima 20.000 m³, si la cantidad de granos supera el máximo del silo, el excedente es desechado.
Cada barco que ancla en la terminal descarga siempre una cantidad de granos que es equiprobable entre 2000 y 4000 m³, los días de semana descargan cinco barcos simultáneamente, mientras que en el fin de semana solo lo pueden hacer tres barcos debido a que disminuye la cantidad de operarios.
Luego de que los granos se encuentran en el silo, los camiones de transporte, los trasladan a las respectivas empresas compradoras. Los camiones transportan 5000 m³ durante la semana y tan solo 1000 m³ durante el fin de semana.
El motivo de la simulación es estudiar la capacidad del silo y saber qué porcentaje granos se desperdician dado que el silo está totalmente lleno.

- **Datos:** CGD (Cantidad de granos descargada)
- **Control:** CS (Capacidad del silo)
- **Resultado:** PGD (Porcentaje de granos desperdiciados)
- **Estado:** SG (Stock de granos)

| TEF | Evento Propio Δt | Evento Comprometido Δt Futuro | Evento Comprometido Δt Anteriores |
|---|---|---|---|
| - | Entrada x barco | - | - |
|   | Salida x camión | - | - |

### Combustible

Una fábrica desea determinar la cantidad de combustible que necesita una de sus máquinas para una producción. Como se desea ajustar los costos, se medirá la performance de una máquina para establecer si el ajuste puede efectuarse en la compra de combustible, haciéndola trabajar con la mínima cantidad de combustible.
La máquina empieza a funcionar con una cantidad x de combustible. A cada minuto la máquina recibe una cantidad preestablecida de combustible por un sistema automático de carga. Se conoce la cantidad de combustible que la máquina necesita para esa producción: entre 200 y 500 cm3/minuto. La máquina se detendrá cada hora, descansando diez minutos cada vez (sin dejar de recibir la carga). Se desea obtener el porcentaje de tiempo en minutos en que la reserva de combustible en la máquina se encuentra por debajo del mínimo x establecido.

- **Datos:** CN (Combustible necesario (cm3/minuto))
- **Control:** MC (Mínimo combustible)
- **Resultado:** PRCDM (Porcentaje en que la reserva de combustible está debajo al mínimo)
- **Estado:** SC (Stock de combustible)

| TEF | Evento Propio Δt | Evento Comprometido Δt Futuro | Evento Comprometido Δt Anteriores |
|---|---|---|---|
| - | Entra x carga | - | - |
|   | Sale x consumo | - | - |

### Proveedor lechero

Un proveedor desea acordar con el cliente la cantidad de leche que le suministrara cada día. Para satisfacer la demanda acordada, el proveedor posee 100 vacas, las cuales producen entre 300 y 400 litros de leche por día (corresponde a una fdp). Par cada litro de leche entregado el proveedor, recibe un beneficio de $ 0,05. Por cada litro de leche faltante para satisfacer lo acordado, tiene una pérdida de $0,01. Por cada litro de leche sobrante tiene una pérdida de $0,02 debido a que la leche es derrochada. Se desea conocer cuál es la cantidad de litros de leche que el proveedor puede ofrecer a su cliente, para obtener el máximo beneficio.

- **Datos:** CLP — Cantidad de leche / día
- **Control:** CLA (Cantidad de litros acordados)
- **Resultado:** BEN (Beneficio)
- **Estado:** BEN (Beneficio)

| TEF | Evento Propio Δt | Evento Comprometido Δt Futuro | Evento Comprometido Δt Anteriores |
|---|---|---|---|
| - | Entra x venta | - | - |
|   | Sale x faltante | - | - |
|   | Sale x sobrante | - | - |

### Performance servidor SAP

Un servidor de aplicación SAP ejecuta procesos de distintos tipos en paralelo. Los principales tipos de procesos son de Diálogo o Background. Los de Diálogo son generados por la interacción de los usuarios con el sistema y los de tipo Background son generados por la aplicación.
El servidor cuenta con 17 work process, 10 de los cuales están actualmente seteados para ejecutar procesos de Diálogo y 7 para Background.
El sistema se encuentra operativo entre las 0 y 22hs. Al finalizar el día se baja el servidor de aplicación y se descartan todos los procesos que se encontraban en espera de ejecución.
Se cuenta con los datos relativos a: la cantidad de procesos Background , la cantidad de procesos Diálogo, la capacidad de ejecución de procesos Background y la capacidad de procesos de Diálogo por hora.
Se estudiará la mejor distribución entre los work process a fin de minimizar los tiempos de espera y mejorar la experiencia de usuario. Por ello es necesario obtener el porcentaje de horas que hubo procesos en espera y cuál fue la máxima cantidad de procesos en espera, de ejecución de cada tipo.

- **Datos:** CPB (Cantidad de procesos Background), CPD (Cantidad de procesos Diálogo), CEPB (Capacidad de ejecución de procesos Background), CEPD (Capacidad de procesos de Diálogo)
- **Control:** WPB (WorkProcess Background), WPD (WorkProcess Diálogo)
- **Resultado:** PHPE (% de horas que hubo procesos en espera), MAXEB (Máxima cantidad de background en espera), MAXED (Máxima cantidad de diálogo en espera)
- **Estado:** P (Procesos)

| TEF | Evento Propio Δt | Evento Comprometido Δt Futuro | Evento Comprometido Δt Anteriores |
|---|---|---|---|
| - | Llegan ProcesosB | - | - |
|   | Llegan ProcesosD |   |   |
|   | Salen ProcesosB |   |   |
|   | Salen ProcesosD |   |   |

### Proyecto de inversión

Se desea evaluar el riesgo de obtener un préstamo hipotecario para la compra de una vivienda.
La evaluación se realizará a través de un préstamo con tasa variable y como referencia se ha tomado al Banco Nación, el mismo ofrece la siguiente información.
Sistema Frances.
Tasa fija nominal anual del 14.75% para los primeros 4 años. (1,153% mensual)
Tasa variable nominal anual del: 14.75% (1,153% mensual)
Gastos administrativos mensuales: 3% sobre el valor de cuota de servicio.
Seguros, caja de ahorro + otros gastos mensuales: 6% sobre el valor de cuota de servicio.
Total Gastos administrativos 9% anual (0,75% mensual) (9*100/12)
Nota: Estas tasas son propias del Banco Nación, pero también se desea poder estudiar con información de otras entidades con fines comparativos dado que la mayoría de las entidades manejan los mismos conceptos de tasas y gastos por cuota de servicio.
Las tasas anteriores son afectadas mensualmente acorde a las tasas inflacionarias del país (Ley de Fisher). Para ello se cuenta con una f.d.p que representará las variaciones inflacionarias acorde a registros históricos extraídos del INDEC.
Esto deberá ser solventado por un ingreso neto mensual, pero dicho ingreso será afectado por:
Gastos personales mensuales, variables y fijos.
Mejora salarial, beneficios, bonos, etc.
(Estos datos son representados por f.d.p creadas a partir de valores históricos y proyecciones).
Lo que se desea determinar es si, con el ingreso mensual más una proyección de una mejora del mismo es posible solventar los posibles gastos personales más la cuota del crédito.
Como base se desea obtener un préstamo de $90000 en un plazo de 240 meses (20 años), teniendo en cuenta esto surgen diversas preguntas:
¿Cuál es el monto promedio de la deuda total?
¿Cuál será el valor promedio de la cuota mensual?
¿Cuál fue el porcentaje de veces que el ingreso fue afectado más de un 40% para saldar la cuota vigente del préstamo?
¿Cuál fue el porcentaje de veces que el ingreso disponible (Ingreso – cuota total – gastos personales) fue del 40% o sup? (Posibilidad de ahorro)
¿Cuál fue el porcentaje de veces que el ingreso no pudo solventar por completo todos los gastos? ¿Conviene sacarlo en un plazo menor?
¿Conviene pedir un crédito de mayor monto?

- **Datos:** VI, GPV, GPF, MIM — Variación inflacionaria / Gastos personales variables / mensual / Gastos personales fijos / mensual / Mejora ingreso mensual
- **Control:** IM (Ingreso mensual), PC (Plazo del crédito), MC (Monto del crédito)
- **Resultado:** MPDT (Monto promedio de la deuda total), VPCM (Valor promedio de la cuota mensual), PIA40 (% que el ingreso fue afectado más de un 40%), PD40S (% que el disponible fue del 40% o sup), PINPSG (% ingreso no pudo solventar totalidad de gastos)
- **Estado:** STD (Stock de dinero)

| TEF | Evento Propio Δt | Evento Comprometido Δt Futuro | Evento Comprometido Δt Anteriores |
|---|---|---|---|
| - | Entra x ingreso | - | - |
|   | Entra x mejora |   |   |
|   | Sale x crédito |   |   |
|   | Sale x gasto fijo |   |   |
|   | Sale x gasto variable |   |   |

### Minimercado

En un minimercado, se ha notado que hay horas en las que la cajera tiene problemas con el cambio de monedas de 25 centavos, donde muchas veces la cantidad que se trae del banco no es suficiente para cubrir la necesidad de reposición en la caja (debiendo ir nuevamente al banco).
Se desea hacer un análisis para determinar la cantidad de cambio que sería necesario pedir al banco, de modo de minimizar la cantidad de veces que el cadete sale a buscar monedas.
Existe una cantidad mínima de monedas para realizar el pedido de reposición, se tiene la función de demora del cadete en ir al banco (de 1 a 2 horas).
Siempre se traen del banco $100 en monedas de 0,25.
Se conocen las f.d.p. de la cantidad promedio de cambio en monedas que entrega la cajera por hora y la cantidad de cambio que da la gente por hora.

- **Datos:** MEC (Monedas que entrega la cajera), MRC (Monedas que recibe la cajera), DC (Demora del cadete)
- **Control:** STR (Stock de reposición), CMS (Cantidad de monedas solicitada)
- **Resultado:** CVC (Cantidad de viajes del cadete)
- **Estado:** M (Monedas)

| TEF | Evento Propio Δt | Evento Comprometido Δt Futuro | Evento Comprometido Δt Anteriores |
|---|---|---|---|
| FLL | Entrega de vuelto | Salida del cadete | Llegada del cadete |
|   | Cobro |   |   |

### Chucherías S.A.

Chucherías es una empresa que fabrica y vende chucherías al por menor. Trabaja de lunes a viernes y programa su producción un mes por adelantado. El primer día de cada mes la fábrica envía a su salón de ventas la producción del último mes en cajas de 500 chucherías cada una. La cantidad de productos vendidos diariamente de manera minorista se conoce y responde a una FDP (VD). En los últimos meses el jefe de ventas conseguido un cliente muy especial: un salón de eventos compra una vez al mes gran cantidad de chucherías. Este cliente es tan importante que se lo llama telefónicamente para acordar una fecha de visita (el salón de eventos demora entre 10 y 15 días en concurrir al salón de ventas). El día que el cliente visita el salón de ventas, éste se cierra para ventas minoristas. La cantidad chucherías que compra el salón de eventos ese día responde a una FDP (VSE). Chucherías S.A. desea determinar cuántas cajas de chucherías debe fabricar al mes para maximizar el beneficio mensual. Sabiendo que:
Costo de fabricación: $500.- por cada caja.
Precio de venta minorista: $5.- por chuchería.
Costo de ventas perdidas minoristas: $3.- por chuchería.
Además, si no se puede satisfacer la cantidad de chucherías solicitadas por el salón de eventos, se invita a cenar al dueño del salón y a su familia a un restaurant 5 tenedores, lo que genera un gasto de $1500.

- **Datos:** VD (Venta Diaria), DE (Demora en Entrega), VSE (Venta del Salón de Eventos)
- **Control:** N (Cajas)
- **Resultado:** BEN (Beneficio)
- **Estado:** ST (Stock)

| TEF | Evento Propio Δt | Evento Comprometido Δt Futuro | Evento Comprometido Δt Anteriores |
|---|---|---|---|
| FLLC | Venta minorista | Venta salón de eventos | Llamada del cliente |
|   | Llega Fabricante |   |   |

/ Conflicto Malandia - Tika Nova
La república de Malandia entró en conflicto con Tika Nova. Previniendo una posible guerra, el Jefe de Fuerzas ordenó realizar una simulación para determinar si el país está en condiciones de afrontar una guerra.
Se supone que las batallas suceden día a día. Las muertes en batalla están dadas por una f.d.p. conocida. Se necesita una cantidad mínima de soldados para afrontar una batalla; no afrontarla implicaría una pérdida de territorio, que trae aparejado un costo relacionado con una estadística de muertes. Luego de una batalla, se recuentan los sobrevivientes y si dicho número está debajo de una cantidad mínima, se llama al cuartel para pedir refuerzos.
Son datos: Costo de Alimentación de tropa (CCOM) = $10 x soldado / día
Costo de transporte de refuerzos (CTR). Los soldados se transportan por tres medios, siendo el porcentaje de transporte:

| Transporte | % | Precio | Demora |
|---|---|---|---|
| Aéreo | 10% | 10 cada soldado | 1 día |
| Barco | 40% | 8 | 2 a 4 días |
| Tierra | 50% | 2 | 3 a 6 días |

Costo de perdida de territorio (CPT)= fdp conocida.

- **Datos:** MB (Muertes en batalla), CPT (Costo de perdida de territorio), CCOM (Costo de alimentación de tropa), CTR (Costo de transporte de refuerzos)
- **Control:** MS (Mínimo de soldados), SR (Soldados de refuerzo)
- **Resultado:** CTG (Costo total de guerra)
- **Estado:** S (Soldados)

| TEF | Evento Propio Δt | Evento Comprometido Δt Futuro | Evento Comprometido Δt Anteriores |
|---|---|---|---|
| TPR | Muerte soldados | Pedido de refuerzo | Llegada de refuerzo |
|   | Llegada de refuerzo | - | - |

### Empresa que administra un puerto

Una empresa que administra un puerto desea instalar un silo para el almacenamiento de granos.
Durante la temporada de cosecha, los molinos envían los camiones hasta el puerto para comprar los granos. Cuando al silo le quedan pocas toneladas, la empresa llama a su único proveedor y este envía su barco (siempre se compra la misma cantidad de granos).
El intervalo de arribo (lA) de los camiones al puerto; la cantidad de granos, en toneladas, que compra cada camión (TN) y los días que demora el barco (DE) en llegar al puerto responden a f.d.p. conocidas. El puerto trabaja de 7:00 de la mañana 20:00 Hs. Si el silo se encuentra vacío los camiones están dispuestos a esperar hasta el-día siguiente. Si la espera es de 2 días, el 48% de los camiones se va a otro puerto. Si la espera supera los 2 días, ninguno de los camiones se queda.
El costo de almacenamiento en el silo es de $250 por tonelada por día de almacenamiento. El costo de tener esperando a los camiones es de $40 por tonelada que compra por día de espera. El costo de perder camiones es de $65 por tonelada que este no compra. El costo de llamar al barco del proveedor es de $15.
Todos los días cuando el puerto comienza a atender hay un camión.
No se preveen perturbaciones- aleatorias externas.
Se desea conocer de qué tamaño debe construirse el silo, y el costo de su funcionamiento.

- **Datos:** IA (Intervalo entre arribos de camiones), TN (Toneladas que compra c/camión), DE (Demora del barco)
- **Control:** TS (Tamaño del silo), SR (Stock de reposición)
- **Resultado:** CF (Costo de funcionamiento)
- **Estado:** STG (Stock de granos)

| TEF | Evento Propio Δt | Evento Comprometido Δt Futuro | Evento Comprometido Δt Anteriores |
|---|---|---|---|
|   | Entra granos x barco | Pedido de barco | Llegada de barco |
|   | Sale granos x compra |   |   |

### Extensión línea B del subte

Debido a que se extenderá el recorrido de la línea B de subte desde Alem hasta Los Incas, se desea re
programar el intervalo de arribo de cada tren (lA) que será mayor a un minuto y la cantidad de vagones de cada tren (CV), teniendo en cuenta que la capacidad de cada vagón es de 50 personas y que una vez que se llena el vagón, no entra más gente.
Para ella, el estudio de un grupo de probabilistas determinó que la cantidad de personas que llega al anden en las horas pico a las estaciones de mayor concurrencia (FLLP) varía entre 20 y 40 personas por minuto, y responde a una f.d.p lineal donde f(40) = 2*f(20).
Los datos a calcular son el porcentaje de personas que tuvieron que esperar en el andén al siguiente tren (porque el tren que les correspondía estaba lleno) con respecto al total de personas que utilizaron el subte (PPAA) y el promedio de personas que viajaron con respecto al total que entrarían en el subte si todos los vagones estuvieran llenos en todos los viajes (PPV). Estos datos ayudaran a elegir un lA y CV correctos para que la cantidad de gente que se acumule no sea muy grande y para que en la capacidad de los subtes sea bien aprovechada.

- **Datos:** FLLP — Personas / minuto
- **Control:** IA, CV
- **Resultado:** PPAA (% personas que esperaron el siguiente tren respecto al total que usaron el subte), PPV (Promedio de personas que viajaron respecto al total si todos los vagones están llenos)
- **Estado:** GA (Gente en anden)

| TEF | Evento Propio Δt | Evento Comprometido Δt Futuro | Evento Comprometido Δt Anteriores |
|---|---|---|---|
|   | Entra x arribos |   |   |
|   | Sale x subte |   |   |

### Correos

Una empresa de correos desea estudiar el rendimiento de su depósito de correspondencia con relación a su capacidad óptima (conocida).
La correspondencia entrante se almacena en el depósito donde se clasifica para su distribución.
La cantidad de correspondencia entrante está dada por una función equiprobable entre 20 y 100 cartas por hora (esta cantidad se triplica en la época de las fiestas). Los turnos de trabajo están dispuestos de modo que llegan carteros en cualquier momento del día en busca de correspondencia a distribuir, llevándose por hora siempre la misma cantidad.
Se desea saber el porcentaje de veces que la cantidad de correspondencia en el depósito excede su capacidad óptima; para el ajuste de la misma y de la cantidad retirada por los carteros.

- **Datos:** IA — Cartas / h
- **Control:** COD (Capacidad óptima del depósito), CR (Cantidad retirada)
- **Resultado:** PECO (% excede capacidad óptima)
- **Estado:** SC (Stock de cartas)

| TEF | Evento Propio Δt | Evento Comprometido Δt Futuro | Evento Comprometido Δt Anteriores |
|---|---|---|---|
| - | Entra x arribo | - | - |
|   | Sale x cartero | - | - |

### Mc Dowels

La cadena de Fast Food McDowel’s desea abrir una sucursal en el barrio de Palermo. El objetivo es maximizar el beneficio. Para ello, atenderá de lunes a lunes, las 24hs, a sus clientes sin excepción.
De acuerdo a un estudio de mercado que le hizo la agencia MarketSearching & Asoc, las ventas por hora estarían entre 8 y 11 (equiprobablemente).
La especialidad del lugar es el BIGMacD, que está compuesto por 3 panes y dos hamburguesas con una exquisita salsa, cuya receta es secreto de la casa. Además puede tener lechuga y tomate opcional sin cargo.
Por cada BIGMacD que vende gana $4. Los BIGMacD que no se venden, se desechan al final del día, lo cual tiene un costo de $0.04 por cada pan y de $0.1 por cada hamburguesa. El costo de la lechuga y tomate es despreciable.
Si se quedan sin mercadería para vender les genera un costo de $3 por cada BIGMacD. Cada mañana, antes de abrir, llega el camión para reponer el stock del día, con una cantidad fija.
El gran dilema es ¿cuántos BIGMacD debería tener el local para vender en el día?

- **Datos:** VH — Ventas de BigMacD / Hora
- **Control:** TP (Tamaño de Pedido (lote óptimo) de BigMacD)
- **Resultado:** $ (BEN – DES –VP) (Ganancia (Beneficio por Venta – Desperdicio – Ventas Perdidas))
- **Estado:** BIGMAC (ST de BigMacD)

| TEF | Evento Propio Δt | Evento Comprometido Δt Futuro | Evento Comprometido Δt Anteriores |
|---|---|---|---|
| - | Llega el pedido de Hamburguesas |   |   |
|   | Vendo Hamburguesas |   |   |

### Emprendimiento apícola

Se pretende estimar el rendimiento de un pequeño emprendimiento apícola ubicado en la provincia de Buenos Aires.
El objetivo principal de dicha organización es detectar el comportamiento que tendrá su inversión a la largo de varios años. Se pretende encontrar la cantidad de colmenas a introducir en el micro-emprendimiento, y cómo distribuir la producción para destinar miel al mercado interno y lograr exportar, es decir, cuántos kilos se aportarán al país y cuántos destinará al exterior cada año.
Estas dos últimas cantidades se deben cubrir indefectiblemente, es por ello que se desea estudiar entre otros, cuál es el porcentaje de “incumplimiento” que se produce al elegir diferentes cantidades.
A su vez, a la organización le interesa calcular el costo que le demandará dicha inversión anualmente.
A raíz de las investigaciones y de los datos que se obtuvieron de las mismas, se cuenta con la siguiente información, que pasará a formar los datos de nuestra simulación:
KMC: Representa los kilos de miel que una colmena puede producir anualmente en la región que el micro-emprendimiento pretende establecerse. Son valores que se obtienen a través de la equiprobabilidad entre 30 y 35 kg/col/año.
PVN: Representa el precio de venta al mercado interno (nacional) por kilo. Son valores que se obtienen a través de la equiprobabilidad entre US$2,80 y US$3,20.
PVE: Representa el precio de venta de exportación por kilo. Son valores que se obtienen a través de la equiprobabilidad entre US$2,20 y US$2,40.
CPM: Costo de producción de cada kilo de miel. Son valores que se obtienen a través de la equiprobabilidad entre $ 0,65 y $ 0,80 el kilo.

- **Datos:** KMC, PVN, PVE, CPM — Kilos de miel / col / año / Precio nacional / kilo / Precio exportación / kilo / Costo de producción / kilo
- **Control:** C, KE, KN — Colmenas / Kilos exportación / año / Kilos nacional / año
- **Resultado:** PIE (% incumplimiento exportación), PIN (% incumplimiento nacional), CI (Costo de inversión)
- **Estado:** STM (Stock de miel)

| TEF | Evento Propio Δt | Evento Comprometido Δt Futuro | Evento Comprometido Δt Anteriores |
|---|---|---|---|
| - | Entra x colmena | - | - |
|   | Sale x consumo interno |   |   |
|   | Sale x exportación |   |   |
