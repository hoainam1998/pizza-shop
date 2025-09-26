<template>
  <div class="ingredient-select ps-pl-5 ps-pr-5">
    <h4 class="require-icon ps-text-color-606266">Ingredients</h4>
    <div class="ps-display-flex ps-justify-content-space-between ps-mt-7 ps-mb-7">
      <el-button size="small" type="success" :onClick="addNewIngredient">New</el-button>
      <h5 class="ps-text-align-end">Temporary product price: {{ temporaryProductPrice }}</h5>
    </div>
    <ul class="ps-list-style-none ps-pl-0">
      <IngredientItem v-for="(props, index) in ingredients"
        :key="index"
        :options="props.options"
        :value="props.value"
        :amount="props.amount"
        :unit="props.unit"
        :index="index"
        :units="props.units"
        :avatar="props.avatar"
        @onDelete="(v) => deleteIngredientItem(index)(v)"
        @onSelected="(v) => selectedIngredient(index)(v)" />
    </ul>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  defineComponent,
  h,
  type Ref,
  watch,
  onBeforeMount,
  defineModel,
  computed,
  watchEffect,
} from 'vue';
import { ElFormItem, ElSelect, ElOption, ElIcon, ElInput, ElRow, ElCol } from 'element-plus';
import { CloseBold } from '@element-plus/icons-vue';
import { dangerColor } from '@/assets/scss/variables.module.scss';
import { IngredientService } from '@/services';
import { type IngredientType, type OptionType } from '@/interfaces';
import type { AxiosResponse } from 'axios';

type IngredientItemsProp = {
  options: OptionType[];
  value: string;
  amount: number;
  unit: string;
  units: OptionType[];
  avatar: string;
};

type IngredientStore = {
  [key: string]: {
    units: string[];
    avatar: string;
  }
};

const ingredients: Ref<IngredientItemsProp[]> = ref([]);
const ingredientSelected: Ref<IngredientType[] | undefined> = defineModel<IngredientType[] | undefined>('ingredients');
const temporaryProductPrice: Ref<number> = defineModel<number>('temporary-price', { required: true, default: 0 });
const temporaryProductId: Ref<string> = defineModel<string>('temporaryProductId', { default: Date.now().toString() });
const ingredientIdsSelected: Ref<string[]> =
  computed(() => (ingredientSelected.value || []).map((i) => i.ingredientId));
const options: Ref<OptionType[]> = ref([]);
const ingredientStore: IngredientStore = {};

watch(ingredientSelected.value!, () => {
  ingredients.value = assignIngredientItems(ingredients.value, ingredientIdsSelected.value);
  IngredientService.post('compute-product-price', {
    temporaryProductId,
    productIngredients: ingredientSelected.value
  }).then((response: AxiosResponse<number>) => {
    temporaryProductPrice.value = response.data;
  }).catch(() => {
    temporaryProductPrice.value = 0;
  });
});

const assignIngredientItems = (ingredients: (IngredientItemsProp | string)[], ingredientIdsSelected: string[])
  : IngredientItemsProp[] => {
  return ingredients.map((_, index) => {
    const currentIngredient = ingredientStore[ingredientIdsSelected[index] as keyof typeof ingredientStore];
    return {
      options: options.value
        .filter((o) =>
          o.value === ingredientIdsSelected[index]
          || !ingredientIdsSelected.includes(o.value)
        ),
      value: ingredientIdsSelected[index],
      amount: ingredientSelected.value![index].amount!,
      unit: ingredientSelected.value![index].unit!,
      units: (currentIngredient?.units || []).map((unit) => ({ label: unit, value: unit })),
      avatar: currentIngredient?.avatar,
    };
  });
};

const addNewIngredient = (): void => {
  ingredients.value.push({
    options: options.value.filter((o) => !ingredientIdsSelected.value.includes(o.value)),
    value: '',
    amount: 0,
    unit: '',
    avatar: '',
    units: [],
  });
};

const deleteIngredientItem = (index: number) => (ingredientId: string): void => {
  const indexSelected = ingredientIdsSelected.value.indexOf(ingredientId);
  ingredientSelected.value!.splice(indexSelected, 1);
  ingredients.value.splice(index, 1);
};

const selectedIngredient = (index: number) => (ingredient: IngredientType): void => {
  if (ingredientSelected.value![index]) {
    ingredientSelected.value![index] = ingredient;
  } else {
    ingredientSelected.value!.push(ingredient);
  }
};

const IngredientItem = defineComponent((props:
  {
    options: OptionType[],
    value: string,
    index: number,
    amount: number,
    unit: string,
    units: OptionType[],
    avatar: string;
  }, ctx: any): () =>
  ReturnType<typeof h> => {
  const selected = ref(props.value);
  const amount = ref(props.amount);
  const unit = ref(props.unit);
  const deleteFn = () => ctx.emit('onDelete', selected.value);

  watchEffect(() => {
    ctx.emit('onSelected', {
      ingredientId: selected.value,
      amount: amount.value,
      unit: unit.value,
    });
  });

  return () => {
    return h('li',
      null,
      h(ElFormItem,
        {
          rules: { required: true, trigger: 'change' },
          prop: `ingredients.${props.index}`,
          class: 'ps-mb-0'
        },
        {
          default: () => h(ElRow,
            { gutter: 10, justify: 'space-between', align: 'middle', class: 'ps-w-100 ps-h-60px' }, {
            default: () => [
              h(ElCol, { xl: 3 }, {
                default: () => h('img',
                  {
                    src: props.avatar,
                    class: 'ps-mt-10',
                    width: 50,
                    height: 50,
                  }),
              }),
              h(ElCol, { xl: 10 }, { default: () => h(ElFormItem, {
                rules: { required: true, trigger: 'change' },
                prop: `ingredients.${props.index}.ingredientId`,
                showMessage: false,
              }, {
                default: () => h(ElSelect, {
                  modelValue: selected.value,
                  placeholder: 'Select a ingredient!',
                  name: 'ingredients',
                  'onUpdate:modelValue': (newValue) => {
                    selected.value = newValue;
                  },
                }, {
                  default:
                    () => props.options.map((option, index) =>
                      h(ElOption, { key: index, value: option.value, label: option.label }))
                })
              })
            }),
              h(ElCol, { xl: 4 }, {
                default: () => h(ElFormItem, {
                  rules: { required: true, trigger: 'change' },
                  prop: `ingredients.${props.index}.amount`,
                  showMessage: false,
                }, {
                  default: () => h(ElInput, {
                    modelValue: amount.value,
                    name: 'amount',
                    type: 'number',
                    class: 'ps-flex-grow-1',
                    'onUpdate:modelValue': (newValue) => {
                      amount.value = +newValue!;
                    }
                  })
                })
              }),
              h(ElCol, { xl: 6 }, {
                default: () => h(ElFormItem, {
                  rules: { required: true, trigger: 'change' },
                  prop: `ingredients.${props.index}.unit`,
                  showMessage: false,
                }, {
                  default: () => h(ElSelect,
                    {
                      modelValue: unit.value,
                      name: 'unit',
                      placeholder: 'Select a unit!',
                      class: 'ps-flex-grow-1',
                      'onUpdate:modelValue': (newValue) => {
                        unit.value = newValue;
                      }
                    },
                    {
                      default:
                        () => props.units.map((option, index) =>
                          h(ElOption, { key: index, value: option.value, label: option.label }))
                    }),
                })
              }),
              h(ElCol, { xl: 1, class: 'ps-pt-10' }, {
                default: () => h(ElIcon,
                  { color: dangerColor, size: 20, class: 'ps-cursor-pointer', onClick: deleteFn },
                  { default: () => h(CloseBold) })
              })
            ]
          })
        }
      ));
  };
}, {
  props: ['options', 'value', 'index', 'unit', 'units', 'amount', 'avatar'],
  emits: ['onDelete', 'onSelected']
});

onBeforeMount(() => {
  IngredientService.post('all', {
    name: true,
    avatar: true,
    unit: true,
    units: true,
  }).then((response: AxiosResponse<IngredientType[]>) => {
    options.value = response.data.map((ingredient) => {
      Object.assign(ingredientStore, {
        [ingredient.ingredientId]: {
          avatar: ingredient.avatar!,
          units: ingredient.units!
        }
      });
      return {
        label: ingredient.name!,
        value: ingredient.ingredientId,
      };
    });
    ingredients.value = assignIngredientItems(ingredientIdsSelected.value, ingredientIdsSelected.value);
  });
});
</script>
<style lang="scss" scoped>
.require-icon {
  &:before {
    color: var(--el-color-danger);
    content: "*";
    margin-right: 4px;
  }
}
</style>
