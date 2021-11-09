<?php

if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true) {
    die();
}

use Bitrix\Main\Loader;
use Bitrix\Main\LoaderException;
use Bitrix\Main\Entity;
use Bitrix\Main\Application;

class Filter extends CBitrixComponent
{
    private \Nizamov\Main $mainClassObject;
    protected $request;

    public function __construct($component = null)
    {
        parent::__construct($component);
        $this->mainClassObject = new Nizamov\Main();
        $this->mainClassObject->includeModules(['iblock', 'highloadblock']);
        $this->request = Application::getInstance()->getContext()->getRequest();

    }

    /**
     * Возвращает массив всех значений свойств элементов, их тип отображения и название
     * @param $arProps
     * @return array
     */
    private function arrayFilters($arProps): array
    {
        $finalProps = [];
        $elements = $this->getElements();

        foreach ($arProps as $prop) {
            if (!isset($this->arParams['FILTERS'][$prop['CODE']]['TYPE'])) {
                continue;
            } else {
                $finalProps['PROPERTY_' . $prop['CODE']]['TYPE'] = $this->arParams['FILTERS'][$prop['CODE']]['TYPE'];
            }

            switch ($prop['PROPERTY_TYPE']){
                case 'L':
                    $listValues = $this->mainClassObject->getListValuesOfPropertyListByCode($this->arParams['IBLOCK_ID'], $prop['CODE']);
                    $finalProps['PROPERTY_' . $prop['CODE']]['VALUES'] = $listValues;
                    break;
                case 'N':
                    $numbers = [];
                    foreach ($elements as $element) {
                        $numbers[] = $element['PROPERTIES'][$prop['CODE']]['VALUE'] !== false ? (int)$element['PROPERTIES'][$prop['CODE']]['VALUE'] : 0;
                    }
                    $finalProps['PROPERTY_' . $prop['CODE']]['VALUES'] = ['MIN' => min($numbers), 'MAX' => max($numbers)];
                    break;
                case 'E':
                    $arSelectLink = Array("ID", "IBLOCK_ID", "NAME", "DATE_ACTIVE_FROM");
                    $arFilterLink = Array("IBLOCK_ID"=> $prop['LINK_IBLOCK_ID'], "ACTIVE_DATE"=>"Y", "ACTIVE"=>"Y");
                    $linkElements = $this->mainClassObject->getElements($prop['LINK_IBLOCK_ID'], $arFilterLink, $arSelectLink);
                    foreach ($linkElements as $linkElement) {
                        $finalProps['PROPERTY_' . $prop['CODE']]['VALUES'][$linkElement['ID']] = $linkElement['NAME'];
                    }
                    break;
                default:
                    break;
            }

            $finalProps['PROPERTY_' . $prop['CODE']]['NAME'] = $this->arParams['FILTERS'][$prop['CODE']]['NAME'] ?? $prop['NAME'];
        }

       $finalProps = $this->modifyArrayFilter($finalProps);

        return $finalProps;
    }

    /**
     * Модифицирует массив фильтров
     * @param array $finalProps
     * @return array
     */
    private function modifyArrayFilter(array $finalProps):array
    {
        foreach ($finalProps as $key => $finalProp) {
            if (empty($finalProp['VALUES'])) {
                unset($finalProps[$key]);
            } else {
                if ($finalProp['TYPE'] !== 'RANGES') {
                    foreach ($finalProp['VALUES'] as $idValue => $propValue) {

                        if ($this->isValueActive($key, $propValue, $idValue)) {
                            $finalProps[$key]['ACTIVE_VALUES'][] = $propValue;
                        }
                    }
                } else {
                    $finalProps[$key]['ACTIVE_VALUE'] = $this->request->getQuery($key);
                }


            }
        }
        return $finalProps;
    }

    /**
     * Получает все элементы инфоблока
     * @return mixed
     */
    private function getElements(): array
    {
        $sectionCode = $this->arParams['SECTION_CODE'];
        $arSelect = Array("ID", "IBLOCK_ID", "NAME", "DATE_ACTIVE_FROM","PROPERTY_*");
        $arFilter = Array("IBLOCK_ID"=> $this->arParams['IBLOCK_ID'], "ACTIVE_DATE"=>"Y", "ACTIVE"=>"Y");
        if ($sectionCode) {
            $arFilter = array_merge($arFilter, ['SECTION_CODE' => $sectionCode]);
            $this->arParams['SECTION_CODE'] = $sectionCode;
        }
        return $this->mainClassObject->getElements($this->arParams['IBLOCK_ID'], $arFilter, $arSelect);
    }

    /**
     * Проверяет, активно ли фильтруемое значение
     * @param $propertyCode
     * @param $propertyValue
     * @param $idValue
     * @return bool
     */
    private function isValueActive($propertyCode, $propertyValue, $idValue) :bool
    {
        $active = false;
        $filterValue = $this->request->getQuery($propertyCode);

        if (is_array($filterValue)) {
            if (!empty($filterValue)) {
                $active = in_array($propertyValue, $filterValue) || in_array($idValue, $filterValue);
            }
        } elseif ($filterValue !== '') {
            $active = $filterValue === (string)$propertyValue || $filterValue === (string)$idValue;
        }

        return $active;
    }

    private function setFilter(){
        $arrValues = $this->request->getQueryList()->toArray();
        if (!empty($arrValues)) {
            $GLOBALS[$this->arParams['FILTER_NAME']] = $arrValues;
        }
    }


    public function executeComponent()
    {

        $this->arResult['FILTERS'] = $this->arrayFilters($this->mainClassObject->getListProperties($this->arParams['IBLOCK_ID']));

        $this->setFilter();

        $this->includeComponentTemplate();
    }
}