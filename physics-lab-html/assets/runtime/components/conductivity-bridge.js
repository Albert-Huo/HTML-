(function initConductivityBridge(globalScope) {
  const root = globalScope.PhysicsLabRuntime = globalScope.PhysicsLabRuntime || {};
  const primitives = root.primitives = root.primitives || {};
  const components = root.components = root.components || {};

  function normalizeItem(item) {
    return {
      id: item.id,
      name: item.name || item.id,
      type: item.type || (item.conductive ? '导体' : '绝缘体'),
      conductive: Boolean(item.conductive)
    };
  }

  function createConductivityBridge({
    items = [],
    dropZoneRect = { x: 0, y: 0, width: 180, height: 60 },
    slotOffsetY = 18
  } = {}) {
    const registry = new Map(items.map((item) => {
      const normalized = normalizeItem(item);
      return [normalized.id, normalized];
    }));

    const state = {
      connectedItemId: '',
      circuitOn: false,
      dropZoneRect: { ...dropZoneRect },
      slotOffsetY
    };

    function getItem(itemId) {
      const item = registry.get(itemId);
      if (!item) {
        throw new Error(`Unknown bridge item: ${itemId}`);
      }
      return item;
    }

    function evaluate(itemId = state.connectedItemId) {
      if (!itemId) {
        return {
          connectedItemId: '',
          conductive: false,
          circuitOn: false,
          itemName: '未接入',
          itemType: '--',
          phenomenon: '等待接入材料',
          resultText: '等待观察'
        };
      }

      const item = getItem(itemId);
      const circuitOn = Boolean(item.conductive);
      return {
        connectedItemId: item.id,
        conductive: item.conductive,
        circuitOn,
        itemName: item.name,
        itemType: item.type,
        phenomenon: circuitOn ? '灯泡发光，电路导通' : '灯泡不发光，电路不导通',
        resultText: circuitOn ? '该材料能导电' : '该材料不导电'
      };
    }

    return {
      connectItem(itemId) {
        const item = getItem(itemId);
        state.connectedItemId = item.id;
        state.circuitOn = item.conductive;
        return evaluate();
      },
      disconnect() {
        state.connectedItemId = '';
        state.circuitOn = false;
        return evaluate();
      },
      evaluate,
      getPhenomenon() {
        return evaluate().phenomenon;
      },
      snapItem({ itemRect, threshold = 18 }) {
        const targetRect = {
          x: state.dropZoneRect.x + (state.dropZoneRect.width - itemRect.width) / 2,
          y: state.dropZoneRect.y + state.slotOffsetY,
          width: itemRect.width,
          height: itemRect.height
        };

        return primitives.snapToAnchor({
          subjectRect: itemRect,
          anchorRect: targetRect,
          anchorSide: 'center',
          threshold,
          gap: 0,
          align: 'center'
        });
      },
      getDropZoneRect() {
        return { ...state.dropZoneRect };
      },
      getState() {
        return {
          connectedItemId: state.connectedItemId,
          circuitOn: state.circuitOn,
          dropZoneRect: { ...state.dropZoneRect },
          slotOffsetY: state.slotOffsetY
        };
      }
    };
  }

  components.createConductivityBridge = createConductivityBridge;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createConductivityBridge };
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
