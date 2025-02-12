-----
- Tags: #race-condition #request #web
-----
# Definición

> Las **condiciones de carrera** (también conocidas como **Race Condition**) son un tipo de vulnerabilidad que puede ocurrir en sistemas informáticos donde dos o más procesos o hilos de ejecución compiten por los mismos recursos sin que haya un mecanismo adecuado de sincronización para controlar el acceso a los mismos.

Esto significa que si dos procesos intentan acceder a un mismo recurso compartido al mismo tiempo, puede ocurrir que la salida de uno o ambos procesos sea impredecible, o incluso que se produzca un comportamiento no deseado en el sistema.

Los atacantes pueden aprovecharse de las condiciones de carrera para llevar a cabo ataques de denegación de servicio (**DoS**), sobreescribir datos críticos, obtener acceso no autorizado a recursos, o incluso ejecutar código malicioso en el sistema.

Por ejemplo, supongamos que dos procesos intentan acceder a un archivo al mismo tiempo: uno para leer y el otro para escribir. Si no hay un mecanismo adecuado para sincronizar el acceso al archivo, puede ocurrir que el proceso de lectura lea datos incorrectos del archivo, o que el proceso de escritura sobrescriba datos importantes que necesitan ser preservados.

El impacto de las condiciones de carrera en la seguridad depende de la naturaleza del recurso compartido y del tipo de ataque que se pueda llevar a cabo. En general, las condiciones de carrera pueden permitir a los atacantes acceder a recursos críticos, modificar datos importantes, o incluso tomar el control completo del sistema. Por lo tanto, es importante que los desarrolladores y administradores de sistemas tomen medidas para evitar y mitigar las condiciones de carrera en sus sistemas.

==Cabe destacar que este tipo de ataque se realiza a gran intensidad, es decir, empleando herramientas con bucles enviando solicitudes constantemente para saturar el sistema y que se fuerce al fallo, consiguiendo así que consigamos un dato, o una acción antes de que el servidor la manipule==.

### 1. **Actualización concurrente de saldo en una cuenta bancaria**

- **Escenario**: Un sistema bancario permite realizar depósitos y retiros desde una cuenta bancaria. Un atacante inicia dos solicitudes al mismo tiempo para retirar más dinero del que hay disponible en su cuenta.
- **Problema**: Si el sistema no sincroniza correctamente el saldo de la cuenta, ambas transacciones podrían calcular el saldo antiguo (incorrecto) y procesarse sin darse cuenta de que la cuenta no tiene fondos suficientes. Esto permitiría al atacante retirar más dinero del permitido.
- **Ataque**: El atacante aprovecha una condición de carrera entre los retiros simultáneos.

### 2. **File upload (escalada de privilegios)**

- **Escenario**: Un sistema permite a los usuarios subir archivos. El sistema almacena temporalmente el archivo en un directorio público antes de moverlo a un lugar seguro y restringir los permisos de acceso.
- **Problema**: Si el atacante puede acceder al archivo antes de que se apliquen los permisos de acceso correctos, podría leerlo, modificarlo o reemplazarlo.
- **Ataque**: El atacante sube un archivo, y mientras el archivo está en el directorio público, lo accede para hacer un cambio antes de que el sistema lo mueva a un lugar más seguro.

### 3. **Escritura concurrente en una base de datos**

- **Escenario**: Una aplicación permite que varios usuarios editen el mismo registro en una base de datos. Dos usuarios (o un atacante simulando dos solicitudes simultáneas) pueden intentar modificar el mismo registro al mismo tiempo.
- **Problema**: Si no se controla el acceso concurrente, es posible que la última escritura sobreescriba los cambios de la primera sin darse cuenta, causando pérdida de datos o inconsistencia en el sistema.
- **Ataque**: Un atacante podría aprovechar esta condición de carrera para alterar datos importantes en el sistema sin que el propietario de los datos lo note.

### 4. **Autorización y cambios de estado en el servidor**

- **Escenario**: Un sistema gestiona transacciones de compras en línea donde primero se verifica el pago y luego se procesa el pedido.
- **Problema**: Si un atacante puede enviar una solicitud que marca el pedido como procesado antes de que se complete la verificación del pago, podría obtener el producto sin pagar.
- **Ataque**: El atacante explota una condición de carrera entre la verificación de pago y el procesamiento del pedido.

------