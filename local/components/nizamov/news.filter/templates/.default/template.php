<?php

if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true) {
    die();
}
?>
<form method="get">

    <? foreach ($arResult['FILTERS'] as $code => $filter): ?>
        <p><?= $filter['NAME'] ?></p>
        <? switch ($filter['TYPE']):
            case 'SELECT':
                ?>
                <select name="<?= $code ?>">
                    <? foreach ($filter['VALUES'] as $idValue => $value): ?>
                        <option value="<?= $idValue ?>" <?= in_array($value, $filter['ACTIVE_VALUES']) ? 'selected' : '' ?>><?= $value ?></option>
                    <? endforeach; ?>
                </select>
                <? break;
            case 'CHECKBOX':
                ?>
                <? foreach ($filter['VALUES'] as $idValue => $value): ?>
                <input type="checkbox" name="<?= $code ?>[]" value="<?= $idValue ?>"
                       id="<?= $idValue ?>" <?= in_array($value, $filter['ACTIVE_VALUES']) ? 'checked' : '' ?>>
                <label for="<?= $idValue ?>"><?= $value ?></label>
            <? endforeach; ?>
                <? break;
            case 'RANGES':
                ?>
                <input type="range" min="<?= $filter['VALUES']['MIN'] ?>" max="<?= $filter['VALUES']['MAX'] ?>"
                       name="<?= $code ?>" value="<?= $filter['ACTIVE_VALUE'] ?? $filter['VALUES']['MIN'] ?>">

                <? break;
        endswitch; ?>

    <? endforeach; ?>

    <input type="submit" value="Применить">
    <a href="<?=$APPLICATION->GetCurPage()?>">Сбросить фильтр</a>
</form>
