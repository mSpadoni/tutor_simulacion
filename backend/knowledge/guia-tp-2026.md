# Guía oficial de Trabajos Prácticos 2026

Fuente: "Simulación — Guía de Trabajos Prácticos 2026" (cátedra). Solo enunciados, sin resolución.
Sirven de modelo de consigna para generar ejercicios nuevos, y para saber de qué habla el alumno cuando menciona "el ejercicio N de la guía".
Algunos ejercicios traían gráficos de f.d.p. que no se pudieron pasar a texto (quedan valores sueltos).
Según la clase de N colas (2C 2026), por ahora se trabajan los ejercicios 1 a 12: del 3 al 5 son los ejemplos de colas de la clase, y del 6 al 8 van después de ver Tiempo Comprometido. Los ejercicios de Δt se ven más adelante.

## Enunciados

### Ejercicio 1 — Sistema con un puesto de atención, con su correspondiente cola

Los clientes llegan al sistema con una frecuencia que responde a una función de densidad de probabilidad (f.d.p.) uniforme entre 0 y 10 minutos.
El tiempo de atención que varía según el trámite entre 10 y 20 minutos, se conoce recién cuando el cliente comienza a ser atendido y responde a una f.d.p. lineal donde f(20)=2*f(10).
Aquellos clientes que al llegar encuentran hasta 4 personas en la cola se quedan, si encuentran hasta 8 se queda sólo el 40% y si encuentran más de 8 se retiran todos.
Se pide:
a) Análisis completo: Metodología.
Tabla de eventos independientes o clasificación de eventos. Tabla de eventos futuros.
Clasificación de variables.
Diagrama de flujo.
Fijar las condiciones iniciales tal que el sistema comience a funcionar vacío y en ese momento llegue el primer cliente.
Resolver las f.d.p. por el método más conveniente.
Obtener los siguientes resultados:
Promedio de permanencia en el sistema
Promedio de espera en cola
Porcentaje de tiempo ocioso del puesto de atención.
Porcentaje de personas que se retiraron porque encontraron a 5 personas en la cola con respecto a todas las arrepentidas.

### Ejercicio 2 — Sistema con dos puestos de atención en paralelo, cada uno con su correspondiente cola

Los clientes llegan al sistema con una frecuencia que responde a una función de densidad de probabilidad (f.d.p.) equiprobable entre 0 y 30 minutos y se ubican en la cola con menor cantidad de personas, en caso de igualdad se distribuyen aleatoriamente el 60% a la cola 1 y el 40% a la cola 2.
El tiempo de atención se conoce recién cuando el cliente comienza a ser atendido. Según el trámite varía entre 15 y 35 minutos, y responde a una f.d.p. lineal donde f(35)=3*f(15) (igual para ambos puestos).
Aquellos clientes que al llegar encuentran hasta 2 personas en la cola se quedan, si encuentran 3 personas se queda el 60% y más de 3 el 20%.
Se pide:
a) Análisis completo: Metodología.
Tabla de eventos independientes o clasificación de eventos. Tabla de eventos futuros.
Clasificación de variables.
Diagrama de flujo.
Fijar las condiciones iniciales tal que el sistema comience a funcionar vacío y en ese momento llegue el primer cliente.
Resolver las f.d.p. por el método más conveniente.
Obtener los siguientes resultados por separado para cada puesto de atención:
Promedio de permanencia en el sistema
Promedio de espera en cada cola
Porcentaje de tiempo ocioso de cada puesto de atención.
Porcentaje de personas que al llegar encontraron más de dos personas por delante en la cola y se quedaron respecto del total de personas atendidas.

### Ejercicio 3 — Sistema con n puestos de atención en paralelo, cada uno con su correspondiente cola

Los clientes que llegan al sistema se ubican en la cola con la menor cantidad de gente y en caso de igualdad se ubican siempre en la última cola (n).
Todos los clientes están dispuestos a esperar si encuentran hasta 5 personas por delante en la cola, sólo el 20% espera si encuentra hasta 8, el resto se retira.
Se conoce la f.d.p. del intervalo entre arribo de los clientes y la f.d.p. del tiempo de atención de cada puesto, conocido recién cuando el cliente comienza a ser atendido.
Se pide:
a) Análisis completo: Metodología.
Tabla de eventos independientes o clasificación de eventos. Tabla de eventos futuros.
Clasificación de variables.
Diagrama de flujo.
Obtener los siguientes resultados por separado para cada puesto de atención:
Promedio de permanencia en el sistema
Promedio de espera en cada cola
Porcentaje de tiempo ocioso de cada puesto de atención.
Porcentaje de personas arrepentidas respecto del total de personas que ingresaron al sistema.

### Ejercicio 4 — Sistema con n puestos de atención en paralelo, con UNA ÚNICA COLA

Los clientes que llegan al sistema se ubican en la única cola.
Todos los clientes están dispuestos a esperar si encuentran hasta 10 personas por delante en la cola, sólo el 40% espera si encuentra hasta 20, el resto se retira.
Se conoce la f.d.p. del intervalo entre arribo de los clientes y la f.d.p. del tiempo de atención de cada puesto, conocido recién cuando el cliente comienza a ser atendido.
Se pide:
d) Análisis completo: Metodología.
Tabla de eventos independientes o clasificación de eventos. Tabla de eventos futuros.
Clasificación de variables.
Diagrama de flujo.
Obtener los siguientes resultados:
Promedio de permanencia en el sistema
Promedio de espera en cola
Porcentaje de tiempo ocioso de cada puesto de atención.
Porcentaje de personas arrepentidas respecto del total de personas que ingresaron al sistema.

### Ejercicio 5 — Sistema con 2 puestos de atención en paralelo, cada puesto con diferentes prioridades…

Sistema con 2 puestos de atención en paralelo, cada puesto con diferentes prioridades de atención.
Los clientes que llegan al sistema se ubican en la cola del puesto “A” ó “B” según la siguiente distribución, el 35% se ubica en la cola “A” y el 65% en la cola “B”.
Todos los clientes están dispuestos a esperar.
El puesto de atención “B” atiende a una persona que este haciendo la cola en su puesto solamente si no hay personas esperando ser atendidas en el puesto “A”, o sea que las personas que están haciendo la cola en “A” tienen mayor prioridad que las del puesto “B”.
El puesto de atención “A” atiende solamente a las personas que estén haciendo la cola en su puesto.
Se conoce la f.d.p. del intervalo entre arribo de los clientes y la f.d.p. del tiempo de atención de cada puesto, conocido recién cuando el cliente comienza a ser atendido.
Se pide:
g) Análisis completo: Metodología.
Tabla de eventos independientes o clasificación de eventos. Tabla de eventos futuros.
Clasificación de variables.
Diagrama de flujo.
Obtener los siguientes resultados:
Promedio de permanencia en el sistema
Promedio de espera en cola
Porcentaje de tiempo ocioso de cada puesto de atención.

### Ejercicio 6 — Sistema con un puesto de atención

Los clientes llegan al sistema con una frecuencia que responde a una función de densidad de probabilidad (f.d.p.) equiprobable entre 5 y 20 minutos.
El tiempo de atención se conoce desde la llegada del cliente al sistema y responde a una función normal de Gauss, entre 10 y 20 minutos.
Todos los clientes están dispuestos a esperar hasta 10 minutos, sólo el 60% espera entre 10 y 20 minutos y el 10% espera más de 20 minutos.
Se pide:
a) Análisis completo: Metodología.
Tabla de eventos independientes o clasificación de eventos. Tabla de eventos futuros.
Clasificación de variables.
Diagrama de flujo.
Fijar las condiciones iniciales tal que el sistema comience a funcionar vacío y en ese momento llegue el primer cliente.
Obtener los siguientes resultados:
Promedio de permanencia en el sistema
Promedio de tiempo de atención.
Promedio de espera en cola
Porcentaje de tiempo ocioso del puesto de atención.
Porcentaje de personas que tuvieron que esperar más de 15 minutos antes de ser atendidas.
Porcentaje de personas que tenían que esperar más de 20 minutos y se retiraron con respecto al total de personas arrepentidas.

### Ejercicio 7 — Sistema con dos puestos de atención en paralelo

Los clientes llegan con una frecuencia que responde a una función de densidad de probabilidad (f.d.p.) equiprobable entre 3 y 15 minutos y se ubican en la cola donde serán atendidos antes, en caso de igualdad se distribuyen cíclicamente 3 a la cola 1 y 4 a la cola 2.
El tiempo de atención se conoce desde la llegada, es el mismo para ambos puestos y responde a una f.d.p. del tipo f(x) = [4-(x-4)2 ]/k.
Aquellos clientes que al llegar deben esperar hasta 10 minutos se quedan, sólo el 50% espera hasta 25 minutos, el resto se retira.
Se pide:
a) Análisis completo: Metodología.
Tabla de eventos independientes o clasificación de eventos. Tabla de eventos futuros.
Clasificación de variables.
Diagrama de flujo.
Fijar las condiciones iniciales tal que el sistema comience a funcionar vacío y en ese momento llegue el primer cliente.
Resolver las f.d.p. por el método más conveniente.
Obtener los siguientes resultados por separado para cada puesto de atención:
Promedio de permanencia en el sistema
Promedio de espera en cada cola
Porcentaje de tiempo ocioso de cada puesto de atención.
Porcentaje de personas que al llegar tuvieron que esperar más de 20 minutos y se quedaron respecto del total de personas atendidas.

### Ejercicio 8 — Sistema con n puestos de atención en paralelo

Los clientes que llegan se ubican en la cola donde serán atendidos antes y en caso de igualdad se ubican siempre en la primera cola.
Todos los clientes están dispuestos a esperar el tiempo necesario hasta ser atendido.
Se conoce la f.d.p. del intervalo entre arribo de los clientes y la f.d.p. del tiempo de atención de cada puesto, conocido desde la llegada del cliente al sistema que responde a f(x) = [4-(x-4)2 ]/k.
Se pide:
a) Análisis completo: Metodología.
Tabla de eventos independientes o clasificación de eventos. Tabla de eventos futuros.
Clasificación de variables.
Diagrama de flujo.
Obtener los siguientes resultados por separado para cada puesto de atención:
Promedio de permanencia en el sistema.
Porcentaje de tiempo ocioso de cada puesto de atención.
Porcentaje de personas que tuvieron que esperar mas de 20 minutos antes de ser atendidas.

### Ejercicio 9 — Sistema con puestos en paralelo

El objetivo del estudio consiste en determinar la dotación óptima de personal para atender un pañol que minimice el costo total de funcionamiento. Para ello se debe realizar un análisis económico que requiere conocer el tiempo medio de espera de los operarios que están en la cola frente al pañol y el porcentaje de tiempo inactivo de los pañoleros.
Esta información se obtendrá realizando simulaciones de la operación del pañol, modificando en cada una el número de pañoleros que lo atienden.
Para realizar el estudio se designaron varios grupos de desarrollo, usted deberá desarrollar el ejercicio considerando que se dispone de dos pañoleros que entregan distintas clases de productos a operarios. La información básica obtenida por análisis previos de funcionamiento es la siguiente: tipos de productos entregados, porcentajes de pedido y tiempos de atención (f.d.p. equiprobable) para cada clase:

| CLASE | PRODUCTO | % DE PEDIDO |
|---|---|---|
| A | Herramientas, repuestos, etc. 50 |   |
| B | Materiales de consumo | 35 |
| C | Ropa de trabajo | 15 |

/
TIEMPOS DE ATENCION (entre 3 y 6 minutos) (entre 5 y 10 minutos) (entre 8 y 15 minutos)
Se conoce el intervalo de tiempo entre llegadas sucesivas de operarios (IA) que responde a una función conocida y además que cada operario solicita items de una sola clase, a través de un vale de material que entrega al ingresar al pañol.
Se pide:
a) Análisis completo: Metodología.
Tabla de eventos independientes o clasificación de eventos. Tabla de eventos futuros.
Clasificación de variables. b) Diagrama de flujo.

### Ejercicio 10 — Sistema con puestos en paralelo

Una empresa se dedica a la reparación de aires acondicionados industriales y cuenta con un grupo de técnicos altamente capacitados para atender las necesidades de sus clientes. Cada técnico se encarga de reparar los equipos de acuerdo con los requerimientos específicos de cada caso.
El tiempo necesario para reparar un equipo varía entre 2 y 5 horas, dependiendo de la naturaleza de la avería detectada durante el proceso de diagnóstico. Cada técnico tiene un sueldo anual de $18.000.000.
Se ha estudiado que los equipos ingresan a la empresa con una frecuencia que oscila entre 1 y 5 horas. Cuando un equipo se encuentra inactivo, la empresa incurre en un costo de $2.000 por cada hora de inactividad. El servicio de reparación está disponible las 24 horas del día durante todo el año.
Con el fin de minimizar el costo anual total, es necesario analizar la cantidad de técnicos que la empresa debe contratar.

### Ejercicio 11 — Cámara de seguridad

El Banco Río del Cobre cuenta con un sector denominado Cámara de Seguridad, el cual dispone de una determinada cantidad de cajas de alta seguridad y otra cantidad de cajas de seguridad básicas.
Los clientes solicitan el servicio de alquiler de cajas de seguridad al banco, indicando explícitamente al momento de la contratación el tipo de caja requerido. La frecuencia de llegada de solicitudes responde a una fdp. El porcentaje de distribución es el siguiente: 40% para cajas de alta seguridad y 60% para cajas de seguridad básicas.
Los valores de los clientes se almacenan durante un período determinado, cuya duración también se define mediante una distribución de probabilidad (expresada en días) y depende del tipo de caja de seguridad contratada. Una vez finalizado dicho período, la caja queda nuevamente disponible para su asignación a otro cliente.
En caso de no haber disponibilidad, los clientes no están dispuestos a esperar más de dos días por la caja solicitada. Si transcurrido ese plazo no se libera una caja del tipo requerido, la solicitud se considera rechazada.
Con el objetivo de evaluar la conveniencia de ampliar la capacidad del sector, se desea analizar el porcentaje de rechazos para cada tipo de caja y el costo mensual asociado a la falta de disponibilidad. El costo diario por no poder ofrecer una caja de alta seguridad es de 5 USD, mientras que para las cajas de seguridad básicas es de 2 USD.

### Ejercicio 12 — Banco de Sangre

Se desea determinar la cantidad semanal de sangre (en litros) que un Banco de Sangre de un Hospital Provincial debe solicitar al Gobierno Nacional, con el fin de abastecer a todos los hospitales municipales de la provincia.
El hospital recibe donaciones de sangre, cuya cantidad responde a una función de distribución de probabilidad (fdp) expresada en litros. Estas donaciones se producen a intervalos variables, también definidos mediante una fdp expresada en días.
Asimismo, el hospital distribuye sangre a diversos centros de salud, entregando una cantidad que responde a una fdp (en litros). El intervalo entre entregas también se encuentra determinado por una distribución uniforme expresada en días.
En caso de no contar con suficiente stock para cubrir la demanda, el hospital debe recurrir al Gobierno Nacional para solicitar la cantidad faltante.
El Gobierno Provincial desea conocer los siguientes resultados, en función de la cantidad solicitada semanalmente:
• El porcentaje de veces que el hospital debió recurrir al Gobierno Nacional para solicitar un envío adicional por falta de stock. / • La mayor cantidad de sangre solicitada al Gobierno Nacional para cubrir un faltante.

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
