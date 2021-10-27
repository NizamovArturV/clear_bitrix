<?php

namespace Nizamov;

class DetailInfo {

    protected Main $objectMain;
    public function __construct()
    {
        \CModule::IncludeModule('iblock');
        \CModule::IncludeModule('highloadblock');
        $this->objectMain = new Main();
    }

    /**
     * Получает реальный путь до файла
     * @param $value
     * @return array|string
     */
    protected function getFile($value) {
        $propertyValue = [];
        if (is_array($value) && !empty($value)) {
            foreach ($value as $arValue) {
                $propertyValue[] = \CFile::GetPath($arValue);
            }
        } else if ($propertyValue !== '') {
            $propertyValue = \CFile::GetPath($value);
        }

        return $propertyValue;
    }

    /**
     * Получает всю информацию об элементах из свойств
     * @param $value
     * @param $iblockLink
     * @param $arFilter
     * @return array
     */
    protected function getElements($value, $iblockLink, $arFilter){
        $propertyValue = [];
        if ($value) {
            $arSelect = Array("ID", "NAME", "DATE_ACTIVE_FROM", 'PREVIEW_PICTURE', 'IBLOCK_ID', 'PREVIEW_TEXT', 'PROPERTY_*');
            $elements = $this->objectMain->getElements($iblockLink, $arFilter, $arSelect);
            foreach ($elements as $key => $element) {
                $element['PREVIEW_PICTURE'] = CFile::GetPath($element['PREVIEW_PICTURE']);
                foreach ($element['PROPERTIES'] as $keyElementProp => $elementProp) {
                    switch ($elementProp['PROPERTY_TYPE']) {
                        case 'F':
                            $element['PROPERTIES'][$keyElementProp] = $this->getFile($elementProp['VALUE']);
                            break;
                        case 'E':
                            $arSelectElement = Array("ID", "NAME", "DATE_ACTIVE_FROM", 'PREVIEW_PICTURE', 'DETAIL_TEXT', 'PREVIEW_TEXT', 'IBLOCK_ID', 'PROPERTY_*');
                            $arFilterElement = Array("IBLOCK_ID"=>$elementProp['LINK_IBLOCK_ID'], "ACTIVE_DATE"=>"Y", "ACTIVE"=>"Y", 'ID' => $elementProp['VALUE']);
                            $resElements =  $this->objectMain->getElements($elementProp['LINK_IBLOCK_ID'], $arFilterElement, $arSelectElement);
                            foreach ($resElements as $keySub => $resElement) {
                                $resElement['PREVIEW_PICTURE'] =\CFile::GetPath($resElement['PREVIEW_PICTURE']);
                                if (is_array($elementProp['VALUE'])) {
                                    $element['PROPERTIES'][$keyElementProp]['ITEMS'][] = $resElement;
                                } else {
                                    $element['PROPERTIES'][$keyElementProp]['ITEM'] = $resElement;
                                }
                            }

                    }
                }
                if (is_array($value)) {
                    $propertyValue['ITEMS'][] = $element;
                } else {
                    $propertyValue['ITEM'] = $element;
                }
            }
        }
        return $propertyValue;
    }

    /**
     * Получить полную информацию об элементе, принимает массив arItem или arResult на деталке, полностью можно заменить
     * @param $element
     * @return mixed
     */
    public function get($element) {
        foreach ($element['PROPERTIES'] as $key => $prop) {
            switch ($prop['PROPERTY_TYPE']) {
                case 'F':
                    $element['PROPERTIES'][$key]['REAL_PATH'] = $this->getFile($prop['VALUE']);
                    break;
                case 'E':
                    $arFilter = Array("IBLOCK_ID"=> $prop['LINK_IBLOCK_ID'], "ACTIVE_DATE"=>"Y", "ACTIVE"=>"Y", 'ID' => $prop['VALUE']);
                    $element['PROPERTIES'][$key] = $this->getElements($prop['VALUE'], $prop['LINK_IBLOCK_ID'], $arFilter);
                    break;
                case 'G':
                    $arFilter = Array("IBLOCK_ID"=>$prop['LINK_IBLOCK_ID'], "ACTIVE_DATE"=>"Y", "ACTIVE"=>"Y", 'SECTION_ID' => $prop['VALUE']);
                    $element['PROPERTIES'][$key] = $this->getElements($prop['VALUE'], $prop['LINK_IBLOCK_ID'], $arFilter);
                    break;
                default:
                    break;
            }

        }

        return $element;
    }

}