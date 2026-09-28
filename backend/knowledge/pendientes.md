# Material pendiente (todavía no se usa)

> tipo: pendiente

El tutor no carga este archivo. Queda para más adelante: los ejercicios 13 a 22 de la guía oficial y todo lo de la metodología de incremento constante (Δt).

## Guía oficial de Trabajos Prácticos 2026 — ejercicios 13 a 22
### Ejercicio 13 — Sistema con almacenamiento intermedio

Depósito que almacena y vende un producto. Son datos:
La f.d.p. de las ventas diarias que responde a una función conocida. La f.d.p. de la demora en la entrega del proveedor.
Costo de almacenamiento (CALM) = $ 5 por unidad por día de almacenamiento. Costo de emisión de pedido (CEP) = $ 2 por pedido emitido.
Costo de ventas perdidas (CVP) = $ 4 por cada unidad que no puede ser vendida.
No se prevén perturbaciones aleatorias externas que afecten al sistema. Objetivo: analizar el costo de funcionamiento del depósito.
CASO: Ningún cliente acepta recibir la mercadería con atraso.
Se pide:
a) Análisis completo: Metodología.
Tabla de eventos independientes o clasificación de eventos. Tabla de eventos futuros.
Clasificación de variables.
b) Diagrama de flujo para cada uno de los tres casos planteados.

### Ejercicio 14 — Sistema con almacenamiento intermedio

Depósito que almacena y vende un producto. Son datos:
La f.d.p. de las ventas diarias que responde a una función conocida. La f.d.p. de la demora en la entrega del proveedor.
Costo de almacenamiento (CALM) = $ 5 por unidad por día de almacenamiento. Costo de emisión de pedido (CEP) = $ 2 por pedido emitido.
Costo de ventas atrasadas (CVA) = $ 3 por unidad y por día de atraso en la entrega.
No se prevén perturbaciones aleatorias externas que afecten al sistema. Objetivo: analizar el costo de funcionamiento del depósito.
CASO: Todos los clientes aceptan recibir la mercadería con atraso.
Se pide:
a) Análisis completo: Metodología.
Tabla de eventos independientes o clasificación de eventos. Tabla de eventos futuros.
Clasificación de variables.
b) Diagrama de flujo para cada uno de los tres casos planteados.

### Ejercicio 15 — Sistema con almacenamiento intermedio

Depósito que almacena y vende un producto. Son datos:
La f.d.p. de las ventas diarias que responde a una función conocida. La f.d.p. de la demora en la entrega del proveedor.
Costo de almacenamiento (CALM) = $ 5 por unidad por día de almacenamiento. Costo de emisión de pedido (CEP) = $ 2 por pedido emitido.
Costo de ventas perdidas (CVP) = $ 4 por cada unidad que no puede ser vendida. Costo de ventas atrasadas (CVA) = $ 3 por unidad y por día de atraso en la entrega.
No se prevén perturbaciones aleatorias externas que afecten al sistema. Objetivo: analizar el costo de funcionamiento del depósito.
CASO: Algunos clientes aceptan recibir la mercadería con atraso según el siguiente esquema:

| Días de | % de pérdida |
|---|---|
| atraso |   |
| 0 a 2 | 0 % |
| 3 a 5 | 40 % |
| 6 a 8 | 80 % |
| 9 o más | 100 % |

Se pide:
a) Análisis completo: Metodología.
Tabla de eventos independientes o clasificación de eventos. Tabla de eventos futuros.
Clasificación de variables.
b) Diagrama de flujo para cada uno de los tres casos planteados.

### Ejercicio 16 — Sistema con almacenamiento intermedio

Depósito que almacena y vende un producto. Son datos:
La f.d.p. del intervalo entre arribos de los clientes f(IA).
La f.d.p. de la cantidad de productos adquiridos por cada cliente f(CANT). La f.d.p. de la demora en la entrega del proveedor.
Costo de almacenamiento (CALM) = $ 50 por unidad por día de almacenamiento. Costo de emisión de pedido (CEP) = $ 10 por pedido emitido.
Costo de ventas perdidas (CVP) = $ 30 por unidad perdida de vender.
Costo de ventas atrasadas (CVA) = $ 15 por unidad y por día de atraso en la entrega.
No se prevén perturbaciones aleatorias externas que afecten al sistema. El depósito trabaja 8 horas diarias.
El primer cliente llega en el instante en que comienza la simulación.
En caso de no haber suficiente mercadería para vender, los clientes aceptan esperar a que llegue la mercadería.
Objetivo: analizar el costo total de funcionamiento del depósito:

|   | CTF = CAL + CEP + CVP+ CVA | (fórmula general) |   |   |   |   |
|---|---|---|---|---|---|---|
| f(IA) | f(CANT) |   |   |   |   |   |
| 3 h |   |   |   |   |   |   |
| h |   |   |   |   |   |   |
|   | IA (minutos) |   |   |   | CANT |   |
| 50 | 150 | 5 | 25 |   |   |   |

Se pide:
a) Análisis completo: Metodología.
Tabla de eventos independientes o clasificación de eventos. Tabla de eventos futuros.
Clasificación de variables.
Diagrama de flujo.
Desarrollar las rutinas para generar valores de IA y CANT por el método más conveniente.

### Ejercicio 17 — Sistema con almacenamiento intermedio

Depósito que almacena y vende un producto. Son datos:
La f.d.p. del intervalo entre arribos de los clientes f(IA).
La f.d.p. de la cantidad de productos adquiridos por cada cliente f(CANT). La f.d.p. de la demora en la entrega del proveedor, en minutos.
Costo de almacenamiento (CALM) = $ 5 por unidad por minuto de almacenamiento.
Costo de emisión de pedido (CEP) = $ 10 por pedido emitido.
Costo de ventas perdidas (CVP) = $ 30 por unidad perdida de vender.
No se prevén perturbaciones aleatorias externas que afecten al sistema. El primer cliente llega en el instante en que comienza la simulación.
Si la venta no se puede concretar por falta de mercadería, se pierde. Objetivo: analizaar el costo total de funcionamiento del depósito.
f(IA) f(CANT)

2 h
h

|   | IA (minutos) |   | CANT |
|---|---|---|---|
| 5 | 15 | 3 | 13 |

Se pide:
a) Análisis completo: Metodología.
Tabla de eventos independientes o clasificación de eventos. Tabla de eventos futuros.
Clasificación de variables.
Diagrama de flujo.
Desarrollar las rutinas para generar valores de IA y CANT por el método más conveniente.

### Ejercicio 18 — Guantes descartables

Un hospital recibe diariamente una cantidad constante de guantes descartables para el uso del personal. La cantidad de guantes que se utilizan cada día (que depende, entre otros factores, de la cantidad de pacientes atendidos y del personal de guardia presente) responde a una fdp.
Diariamente se descarta el 5% de los guantes existentes por roturas, contaminación o vencimiento del empaque, por lo que no pueden utilizarse.
Además, como existe otro centro de salud cercano perteneciente a la misma red, hay un 20% de probabilidad de que en un día soliciten guantes en préstamo. En ese caso, solo se entregan hasta 1000 unidades, según una distribución uniforme.
Existe un 10% de probabilidad de que en un día se realice una campaña sanitaria o jornada especial de vacunación. / En ese caso, el consumo de guantes de ese día aumenta en un 40% respecto del valor generado por la fdp.
Si no se dispone de suficientes guantes para cubrir la demanda diaria, se produce una pérdida de $1.500 por día debido a demoras, reprogramaciones o compras de urgencia. Por ese motivo, se desea ajustar la cantidad de guantes a pedir para estudiar el costo por faltante.

### Ejercicio 19 — Sistema con almacenamiento intermedio

Sistema de almacenamiento intermedio de una máquina expendedora de cigarrillos de dos rubros: común y light, cuyas funciones de ventas diarias son f(CO) y F(LI) respectivamente.
La máquina tiene por cada rubro un espacio de reserva de 5 atados y una capacidad para almacenar 100 atados (igual al TP para cada rubro) . Se trabaja con un proveedor que satisface ambos rubros, uno para cada mitad del año. Las demoras en la entrega del proveedor, para cada rubro responden a funciones conocidas. Sólo se puede ingresar el pedido cuando el espacio de stock (100 atados) está totalmente vacío, ya que los mismos vienen en un paquete que no se puede desarmar, los atados que exceden la reserva a la llegada del proveedor se desperdician. Se desea conocer para cada rubro, el punto óptimo de reposición que minimice las ventas perdidas (VP) por unidad ($ 0,05) y el desperdicio de atados (DA) ($ 0,40 por unidad).
Se pide:
a) Análisis completo: Metodología.
Tabla de eventos independientes o clasificación de eventos. Tabla de eventos futuros.
Clasificación de variables. b) Diagrama de flujo.

### Ejercicio 20 — Sistema de atención en un supermercado con múltiples cajas en paralelo, cada una con…

Sistema de atención en un supermercado con múltiples cajas en paralelo, cada una con su correspondiente cola.
El supermercado trabaja todos los días de 10 a 20 horas. Todos los días a las 10 comienza vacío.
Se sabe que el flujo de llegada de clientes a las colas de las cajas FLL (cantidad de clientes que llega a las colas de las cajas cada 10 minutos) responde a una f.d.p. uniforme entre 14 y 26.
La f.d.p. de la cantidad de clientes atendidos en promedio por cada caja por hora es aleatoria, equiprobable entre 20 y 35.
Se pide:
a) Análisis completo: Metodología.
Tabla de eventos independientes o clasificación de eventos. Tabla de eventos futuros.
Clasificación de variables.
Diagrama de flujo.
Obtener:
1.- El máximo número de clientes que quedó pendiente de atención al terminar una hora y a qué hora sucedió eso.
2.- Para cada hora del día (11,12,....20), que porcentaje de veces a lo largo de la simulación, había más de 50 personas en las colas esperando ser atendidas.
3.- El promedio de clientes que pasó por las cajas después de la hora de cierre (20 horas) .
4.- Explicar de qué manera encuentra el valor n óptimo, siendo n el número de cajas necesarias para lograr una mejor atención.

### Ejercicio 21 — Sistema represa alimentada por un río y con una salida de agua

Se conoce el volumen inicial almacenado en la represa.
El caudal de agua que llega es aleatorio y responde a dos f.d.p. conocidas, expresadas en m3 por hora, una válida de enero a junio y la otra de julio a diciembre.
El caudal de agua que sale, es constante y está expresado en m3 cúbicos por minuto.
Además sobre la superficie de la represa (dato expresado en m2 ) puede llover. Se sabe que el 30% de los días llueve, de ser así existe una f.d.p. de la cantidad de lluvia caída expresada en milímetros por día.
Se desea realizar un modelo de simulación que reproduzca el funcionamiento de la represa e informe qué porcentaje de días sucedió que al final del día el nivel de la represa estaba por debajo del nivel inicial.
Se pide:
a) Análisis completo: Metodología.
Tabla de eventos independientes o clasificación de eventos. Tabla de eventos futuros.
Clasificación de variables. b) Diagrama de flujo.

### Ejercicio 22 — Sistema represa alimentada por un río y con una salida de agua, con vertedero

Una represa tiene un área media de 100 hectáreas.
Es alimentada por un río cuyo caudal varía de manera equiprobable entre 500.000 y 2.000.000 de metros cúbicos por día.
La represa alimenta una usina que consume “A” metros cúbicos por minuto de lunes a viernes y “B” metros cúbicos por minuto sábados y domingos.
Se instalará un vertedero de desborde que limitará la altura máxima de agua en la represa.
Se desea realizar un modelo de simulación para saber en que porcentaje de días a las 0 hs. del día la represa estaría totalmente llena y cuál sería la altura mínima para diversas alturas del vertedero de desborde.

| Río | Vertedero |
|---|---|

Represa
Se pide:
a) Análisis completo: Metodología.
Tabla de eventos independientes o clasificación de eventos. Tabla de eventos futuros.
Clasificación de variables. b) Diagrama de flujo.

## Guía Anexa resuelta — incremento constante (Δt)

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
