<?php

if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true) {
    die();
}

//Вывод ошибок
if (isset($arResult['ERRORS'])) {
    foreach ($arResult['ERRORS'] as $ERROR) {
        echo '<p style="color:red">' . $ERROR . '</p>';
    }
    die();
}
?>

<?php //Вывод сообщения о статусе оплаты
if (isset($arResult['STATUS_PAY_TEXT'])):?>
    <?= $arResult['STATUS_PAY_TEXT']?>
<?php else:
    //Верстка формы, указывайте в поле name обязательно ключ PROPERTY и в ключе массива код нужного свойства при записи
    //Если хотите, чтобы стоимость считалась на бэке, а не вводом в поле, то опишите фукнцию расчета calculate в файле class.php
    ?>
<form method="post">
    <input type="text" name="PROPERTY[NAME]" placeholder="Имя">
    <input type="text" name="PROPERTY[PHONE]" placeholder="Телефон">
    <input type="text" name="PROPERTY[AMOUNT]" placeholder="Цена">
    <input type="submit" name="apply" value="Оплатить">
</form>
<?php endif;?>