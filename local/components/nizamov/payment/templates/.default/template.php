<?php

if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true) {
    die();
}

?>
<?php if (isset($arResult['STATUS_PAY_TEXT'])):?>
    <?= $arResult['STATUS_PAY_TEXT']?>
<?php else:?>
<form>
    <input type="text" name="amount" placeholder="Цена">
    <input type="submit" name="apply" value="Оплатить">
</form>
<?php endif;?>