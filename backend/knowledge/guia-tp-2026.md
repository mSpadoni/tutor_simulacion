# Guía oficial de Trabajos Prácticos 2026 — ejercicios 9 a 12

> tipo: ejercicio

Fuente: "Simulación — Guía de Trabajos Prácticos 2026" (cátedra). Solo enunciados, sin resolución.
Ejercicios del estilo de la Guía Anexa: sirven como tipo de ejercicio para practicar y como referencia de redacción y complejidad. Los ejercicios 1 a 8 están en "modelos-guia-oficial.md".
Algunos ejercicios traían gráficos de f.d.p. que no se pudieron pasar a texto (quedan valores sueltos).

## Ejercicios de la guía oficial
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
